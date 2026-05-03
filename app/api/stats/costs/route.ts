import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface PriceInterval {
  startDate: Date | string;
  endDate: Date | string | null;
  price: any;
}

interface ServiceWithIntervals {
  id: string;
  serviceName: string;
  category: string | null;
  periodicPrice: any;
  currency: string;
  billingCycle: string;
  status: string;
  isTerminated: boolean;
  url: string | null;
  createdAt: Date;
  startDate: Date | string | null;
  archivedAt: Date | null;
  priceIntervals: PriceInterval[];
}

// Fallback kurzy kdyby v DB nebyly žádné záznamy
const FALLBACK_RATES_TO_CZK: Record<string, number> = {
  CZK: 1,
  EUR: 25.0,
  USD: 23.0,
  GBP: 29.5,
  CHF: 26.0,
  PLN: 5.8,
  HUF: 0.065,
  SKK: 1,
};

// Načte kurzy z DB — vrátí mapu: "CURRENCY-YYYY-MM-DD" nebo "CURRENCY-YYYY-MM" nebo "CURRENCY-YYYY" -> rate
type RatesMap = Map<string, number>;

async function loadDbRates(): Promise<RatesMap> {
  const rates = await (prisma as any).exchangeRate.findMany();
  const map: RatesMap = new Map();
  for (const r of rates) {
    const keyParts = [r.currencyCode.toUpperCase(), r.year];
    if (r.month) keyParts.push(r.month);
    if (r.day) keyParts.push(r.day);
    map.set(keyParts.join("-"), Number(r.rateToCzk));
  }
  return map;
}

/** Najde nejlepší kurz pro dané datum — denní, měsíční průměr, nebo roční průměr */
function getRateForDate(dbRates: RatesMap, currency: string, date: Date, useAverageOnly = false): number {
  const c = currency.toUpperCase();
  if (c === "CZK") return 1;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  if (!useAverageOnly) {
    // 1. Zkusíme přesný den
    const dayRate = dbRates.get(`${c}-${y}-${m}-${d}`);
    if (dayRate) return dayRate;

    // 2. Zkusíme měsíční průměr
    const monthRate = dbRates.get(`${c}-${y}-${m}`);
    if (monthRate) return monthRate;
  }

  // 3. Zkusíme roční průměr
  const yearRate = dbRates.get(`${c}-${y}`);
  if (yearRate) return yearRate;

  // 4. Fallback na pevné kurzy
  return FALLBACK_RATES_TO_CZK[c] ?? 1;
}

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    
    // 1. Služby, které VLASTNÍM (včetně těch archivovaných pro historii)
    const ownedServices = await (prisma.service as any).findMany({
      where: { ownerId: user.id },
      include: {
        priceIntervals: { orderBy: { startDate: "asc" } },
        accessGrants: { where: { status: "ACTIVE" } },
      }
    }) as (ServiceWithIntervals & { accessGrants: any[] })[];

    // 2. Služby sdílené SE MNOU (kde jsem příjemcem a platím)
    const sharedWithMe = await (prisma.accessGrant as any).findMany({
      where: { granteeId: user.id, status: "ACTIVE" },
      include: {
        service: {
          include: {
            priceIntervals: { orderBy: { startDate: "asc" } },
            accessGrants: { where: { status: "ACTIVE" } },
          }
        }
      }
    });

    // Sjednotíme do jednoho seznamu pro výpočet
    const dbRates = await loadDbRates();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // We'll calculate data for the last 12 months + current year
    const monthlyStats: Record<string, { total: number; byCategory: Record<string, number> }> = {};
    const yearlyStats: Record<number, number> = {};
    const serviceRankings: Record<string, { name: string; total: number }> = {};
    const categoryRankings: Record<string, number> = {};
    
    let lifetimeTotal = 0;

    // Helper to get price for a specific date (returns CZK)
    const getPriceForDate = (service: ServiceWithIntervals, date: Date) => {
      // Check intervals first
      const interval = service.priceIntervals.find((pi: PriceInterval) => {
        const start = new Date(pi.startDate);
        const end = pi.endDate ? new Date(pi.endDate) : null;
        return date >= start && (!end || date <= end);
      });

      const rawPrice = interval ? Number(interval.price) : Number(service.periodicPrice);
      const cycle = service.billingCycle;

      // Normalize to monthly price in original currency
      let monthlyRaw: number;
      switch (cycle) {
        case "WEEKLY": monthlyRaw = rawPrice * 4.33; break;
        case "MONTHLY": monthlyRaw = rawPrice; break;
        case "QUARTERLY": monthlyRaw = rawPrice / 3; break;
        case "SEMI_ANNUALLY": monthlyRaw = rawPrice / 6; break;
        case "YEARLY": monthlyRaw = rawPrice / 12; break;
        case "ONEOFF": {
          const sdRaw = service.startDate || service.createdAt;
          const sd = new Date(sdRaw);
          if (date.getMonth() === sd.getMonth() && date.getFullYear() === sd.getFullYear()) {
            monthlyRaw = rawPrice;
          } else {
            monthlyRaw = 0;
          }
          break;
        }
        default: monthlyRaw = rawPrice;
      }

      // Convert to CZK
      // Pro minulé měsíce zkusíme nejlepší dostupný kurz (historický)
      // Pro aktuální/budoucí měsíc použijeme průměr (odhad)
      const now = new Date();
      const isPast = date.getFullYear() < now.getFullYear() || 
                     (date.getFullYear() === now.getFullYear() && date.getMonth() < now.getMonth());
      
      const rate = getRateForDate(dbRates, service.currency, date, !isPast);
      let monthlyCzk = monthlyRaw * rate;

      // --- Logika rozdělení nákladů ---
      const isOwner = service.ownerId === user.id;
      const activeGrants = (service as any).accessGrants || [];
      const slotsCount = 1 + activeGrants.length; // Majitel + aktivní účastníci

      if (isOwner) {
        // Pokud jsem majitel a sdílím, moje část je jen zlomek (pokud je pricingModel EQUAL_SPLIT)
        // Pro zjednodušení bereme že všechny aktivní granty jsou rovným dílem pokud neřeknou jinak
        // Ale v Cestooy majitel platí zbytek. 
        // Pokud jsou 2 další lidi a je to Equal Split, majitel platí 1/3.
        return monthlyCzk / slotsCount;
      } else {
        // Pokud jsem příjemce, moje část je pevně daná nebo podíl
        const myGrant = (service as any).accessGrants?.find((g: any) => g.granteeId === user.id);
        if (myGrant?.pricingModel === "FIXED") {
          return Number(myGrant.fixedAmount || 0) * rate;
        }
        return monthlyCzk / slotsCount;
      }
    };


    // Start from the beginning of that month
    const allRelevantServices = [
      ...ownedServices,
      ...sharedWithMe.map((g: any) => ({ ...g.service, sharedGrant: g }))
    ];

    let earliestDate = new Date();
    allRelevantServices.forEach((s: any) => {
      const startCandidate = s.startDate || s.createdAt;
      if (startCandidate && new Date(startCandidate) < earliestDate) {
        earliestDate = new Date(startCandidate);
      }
    });

    let iterDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    
    while (iterDate <= now) {
      const monthKey = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
      const year = iterDate.getFullYear();
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, byCategory: {} };
      }

      allRelevantServices.forEach((service: any) => {
        const startRaw = service.startDate || service.createdAt;
        const start = new Date(startRaw);
        
        const isArchived = service.status === "ARCHIVED" || service.isTerminated;
        const archivedDate = service.archivedAt ? new Date(service.archivedAt) : null;
        
        const iterMonthStart = new Date(iterDate.getFullYear(), iterDate.getMonth(), 1);
        const archivedMonthStart = archivedDate ? new Date(archivedDate.getFullYear(), archivedDate.getMonth(), 1) : null;

        const wasActive = iterMonthStart >= new Date(start.getFullYear(), start.getMonth(), 1) && 
                          (!isArchived || (archivedMonthStart !== null && iterMonthStart < archivedMonthStart));

        if (wasActive) {
          const userPartMonthlyPrice = getPriceForDate(service, iterDate);
          
          monthlyStats[monthKey].total += userPartMonthlyPrice;
          yearlyStats[year] = (yearlyStats[year] || 0) + userPartMonthlyPrice;
          lifetimeTotal += userPartMonthlyPrice;

          const cat = service.category || "Ostatní";
          monthlyStats[monthKey].byCategory[cat] = (monthlyStats[monthKey].byCategory[cat] || 0) + userPartMonthlyPrice;
          categoryRankings[cat] = (categoryRankings[cat] || 0) + userPartMonthlyPrice;

          if (!serviceRankings[service.id]) {
            serviceRankings[service.id] = { name: service.serviceName, total: 0 };
          }
          serviceRankings[service.id].total += userPartMonthlyPrice;
        }
      });

      // Move to next month
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // Current service monthly costs
    const currentServiceCosts = allRelevantServices
      .filter(s => s.status !== "ARCHIVED" && !s.isTerminated && s.billingCycle !== "ONEOFF")
      .map(s => ({
        id: s.id,
        name: s.serviceName,
        monthlyCost: getPriceForDate(s, now)
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost);

    return NextResponse.json({
      lifetimeTotal,
      yearlyStats,
      monthlyStats,
      serviceRankings: Object.values(serviceRankings).sort((a, b: any) => b.total - a.total),
      currentServiceCosts,
      categoryRankings: Object.entries(categoryRankings)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total),
      currentMonthly: monthlyStats[`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`]?.total || 0
    });

  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[Stats API]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
