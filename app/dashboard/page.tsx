import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import PostComposer from "@/components/trips/PostComposer";
import DashboardFeed from "@/components/social/DashboardFeed";

export const metadata: Metadata = {
  title: "Cestooy | Moje Zeď",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myTrips = await prisma.trip.findMany({
    where: {
      members: { some: { userId: user.id } }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const friendRequests = await prisma.friendship.findMany({
    where: { addresseeId: user.id, status: "PENDING" },
    include: { requester: { select: { name: true, avatar: true } } }
  });

  const firstName = user?.name ? user.name.split(" ")[0] : "Cestovateli";

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Welcome & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ahoj, {firstName}! 🌍</h1>
              <p className="text-secondary mt-1">Kam se vydáme za dalším dobrodružstvím?</p>
            </div>
            <Link href="/dashboard/trips/new" className="btn btn-primary px-8 py-4 shadow-xl shadow-brand-200 hover:scale-105 transition-transform">
              ➕ Nový výlet
            </Link>
          </div>

          {/* Quick Trips Overview */}
          {myTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Aktuální cesty</h2>
                <Link href="/dashboard/trips" className="text-xs font-bold text-brand-600 hover:underline">Všechny výlety →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myTrips.map(trip => (
                  <Link key={trip.id} href={`/dashboard/trips/${trip.id}`} className="group relative h-32 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-brand-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">🎒</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                      <div className="text-white font-bold text-sm truncate">{trip.title}</div>
                      <div className="text-white/60 text-[10px] uppercase tracking-widest">{trip.status === 'ONGOING' ? 'PRÁVĚ TEĎ' : 'PLÁNOVÁNO'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Post Composer on Wall */}
          <div className="card shadow-xl overflow-visible" style={{ borderRadius: '2.5rem' }}>
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="text-xl">✨</span> Sdílej svůj moment
              </h3>
              <PostComposer onSuccess={() => {}} />
            </div>
          </div>

          {/* Main Social Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Zeď zážitků 📸</h2>
            </div>
            <DashboardFeed />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Friend Requests Mini Widget */}
          {friendRequests.length > 0 && (
            <div className="card bg-brand-50 border-brand-100 shadow-xl overflow-hidden" style={{ borderRadius: '2.5rem' }}>
              <div className="p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-600 mb-4">Žádosti o přátelství</h3>
                <div className="space-y-4">
                  {friendRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                        {req.requester.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-xs">{req.requester.name[0]}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{req.requester.name}</div>
                        <div className="text-[10px] text-secondary">Chce být tvůj přítel</div>
                      </div>
                      <Link href="/dashboard/contacts" className="btn btn-primary btn-sm rounded-lg px-3">Zobrazit</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Trips Info */}
          <div className="card shadow-xl overflow-hidden group" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8 text-center space-y-4">
              <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-500">⛺</div>
              <h3 className="font-bold">Další cíl?</h3>
              <p className="text-xs text-secondary">Máš už naplánovanou další cestu? Nezapomeň pozvat přátele!</p>
              <Link href="/dashboard/trips/new" className="btn btn-outline w-full py-4 rounded-2xl">Založit výlet</Link>
            </div>
          </div>

          {/* Community Stats or Activity */}
          <div className="card shadow-xl overflow-hidden" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Tvoje aktivita</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl">🌍</div>
                  <div>
                    <div className="text-xs text-secondary">Navštíveno zemí</div>
                    <div className="font-bold text-xl">--</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-success-100 flex items-center justify-center text-2xl">📸</div>
                  <div>
                    <div className="text-xs text-secondary">Celkem zážitků</div>
                    <div className="font-bold text-xl">--</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
