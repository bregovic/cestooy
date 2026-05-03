import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Přehled",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Později sem přidáme reálná data z DB
  const myTripsCount = 0;
  const sharedTripsCount = 0;

  return (
    <div className="page-content animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--brand-600)" }}>Ahoj, {user.name.split(" ")[0]}! 🌍</h1>
          <p className="text-secondary">Tady začínají tvá dobrodružství.</p>
        </div>
        <Link href="/dashboard/trips/new" className="btn btn-primary" style={{ padding: '12px 24px' }}>
          + Nový výlet
        </Link>
      </div>

      {/* Množiny výletů - Core sekce */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tvé výlety</h2>
          <Link href="/dashboard/trips" className="text-brand-600 font-medium hover:underline">Zobrazit vše</Link>
        </div>

        {myTripsCount === 0 ? (
          <div className="card bg-muted" style={{ borderStyle: 'dashed', borderRadius: 'var(--radius-2xl)' }}>
            <div className="card-body py-16 text-center">
              <div className="mb-4 text-4xl">🎒</div>
              <h3 className="text-lg font-medium mb-2">Zatím žádné výlety</h3>
              <p className="text-muted max-w-sm mx-auto mb-6">
                Vytvoř si svůj první výlet, přidej fotky a pozvi přátele, aby s tebou sdíleli zážitky.
              </p>
              <Link href="/dashboard/trips/new" className="btn btn-outline">Začít plánovat</Link>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {/* Tady budou karty výletů */}
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Poslední aktivita / Feed přátel */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Novinky od přátel</h2>
          <div className="card">
            <div className="card-body py-12 text-center text-muted">
              Sleduj příběhy svých přátel. Jakmile někdo z tvého okolí vyrazí na cestu, uvidíš to zde.
            </div>
          </div>
        </section>

        {/* Rychlé nástroje - Settle Up / Výdaje */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Společné výdaje</h2>
          <div className="card">
            <div className="card-body">
              <p className="mb-4 text-muted">Máš vše vyrovnané? Tady uvidíš přehled dlužných částek z tvých společných výletů.</p>
              <div style={{ padding: '16px', background: 'rgba(249, 165, 33, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(249, 165, 33, 0.2)' }}>
                <span className="text-sm font-medium">Aktuálně: Vše vyrovnáno ✅</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
