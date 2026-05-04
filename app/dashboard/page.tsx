import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cestooy | Moje Zeď",
};

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Bezpečné načtení výletů
    const myTrips = await prisma.trip.findMany({
      where: { members: { some: { userId: user.id } } },
      orderBy: { createdAt: 'desc' },
      take: 3
    }).catch(err => {
      console.error("Trips error:", err);
      return [];
    });

    // Bezpečné načtení žádostí
    const friendRequests = await prisma.friendship.findMany({
      where: { addresseeId: user.id, status: "PENDING" },
      include: { requester: { select: { name: true, avatar: true } } }
    }).catch(err => {
      console.error("Friends error:", err);
      return [];
    });

    const firstName = user?.name ? user.name.split(" ")[0] : "Cestovateli";

    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Ahoj, {firstName}! 🌍</h1>
                <p className="text-secondary mt-1">Kam se vydáme za dalším dobrodružstvím?</p>
              </div>
              <Link href="/dashboard/trips/new" className="btn btn-primary px-8 py-4 shadow-xl shadow-brand-200">
                ➕ Nový výlet
              </Link>
            </div>

            {/* Quick Trips Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myTrips.map(trip => (
                <Link key={trip.id} href={`/dashboard/trips/${trip.id}`} className="group relative h-32 rounded-3xl overflow-hidden shadow-lg">
                  {trip.coverImage ? (
                    <img src={trip.coverImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-100 flex items-center justify-center text-2xl">🎒</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                    <div className="text-white font-bold text-sm truncate">{trip.title}</div>
                  </div>
                </Link>
              ))}
              {myTrips.length === 0 && (
                <div className="col-span-3 p-8 border-2 border-dashed border-muted rounded-3xl text-center text-secondary">
                  Zatím žádné výlety. Založ si svůj první! ✨
                </div>
              )}
            </div>
            
            <div className="p-8 card">
              <h2 className="text-xl font-bold">Zeď zážitků</h2>
              <p className="text-secondary mt-2">Pracujeme na zprovoznění feedu...</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {friendRequests.length > 0 && (
              <div className="card bg-brand-50 p-6 rounded-[2.5rem]">
                <h3 className="font-bold mb-4">Žádosti o přátelství</h3>
                {friendRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold">
                      {(req.requester.name?.[0] || "?")}
                    </div>
                    <div className="flex-1 text-sm font-bold truncate">{req.requester.name}</div>
                    <Link href="/dashboard/contacts" className="btn btn-primary btn-sm rounded-lg">Zobrazit</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return <div className="p-10 card bg-danger-50 text-danger">⚠️ Chyba: {error.message}</div>;
  }
}
