import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import PostComposer from "@/components/trips/PostComposer";
import DashboardFeed from "@/components/social/DashboardFeed";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: "Cestooy | Moje Zeď",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Fetch data with proper includes to avoid issues
  const myTrips = await prisma.trip.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: 'desc' },
    take: 3
  }).catch(() => []);

  const friendRequests = await prisma.friendship.findMany({
    where: { addresseeId: user.id, status: "PENDING" },
    include: { requester: { select: { name: true, avatar: true } } }
  }).catch(() => []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Cestovateli";

  return (
    <div className="animate-fade-in pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Welcome & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-brand-950">Ahoj, {firstName}! 🌍</h1>
              <p className="text-secondary mt-1 font-medium italic">„Každá cesta začíná prvním krokem...“</p>
            </div>
            <Link href="/dashboard/trips/new" className="btn btn-primary px-8 py-4 shadow-xl shadow-brand-200 hover:scale-105 transition-all rounded-2xl">
              ➕ Nový příběh
            </Link>
          </div>

          {/* Quick Trips Overview - The "Stories" look */}
          {myTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-brand-800">Moje aktivní příběhy</h2>
                <Link href="/dashboard/trips" className="text-[10px] font-black text-brand-600 hover:underline uppercase tracking-widest">Zobrazit vše →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myTrips.map(trip => (
                  <Link key={trip.id} href={`/dashboard/trips/${trip.id}`} className="group relative h-40 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={trip.title} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-700">🎒</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                      <div className="text-white font-bold text-base leading-tight group-hover:translate-x-1 transition-transform">{trip.title}</div>
                      <div className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-1">
                        {trip.status === 'ONGOING' ? '🟢 PROBÍHÁ' : '📅 V PLÁNU'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Post Composer on Wall */}
          <div className="card shadow-2xl overflow-visible border-none bg-white/70 backdrop-blur-xl ring-1 ring-white" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">📸</span> Zaznamenej moment
              </h3>
              <PostComposer onSuccess={() => {}} />
            </div>
          </div>

          {/* Main Social Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-brand-950">Nástěnka zážitků ✨</h2>
            </div>
            <DashboardFeed />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Friend Requests Mini Widget */}
          {friendRequests.length > 0 && (
            <div className="card bg-brand-50 border-brand-100 shadow-xl overflow-hidden" style={{ borderRadius: '2.5rem' }}>
              <div className="p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-6">Nové žádosti</h3>
                <div className="space-y-4">
                  {friendRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-white transition-all hover:shadow-md">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center ring-2 ring-brand-100">
                        {req.requester.avatar ? (
                          <img src={req.requester.avatar} className="w-full h-full object-cover" alt={req.requester.name} />
                        ) : (
                          <span className="font-black text-brand-600">{(req.requester.name?.[0] || "?")}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-brand-950">{req.requester.name}</div>
                        <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">Chce tě sledovat</div>
                      </div>
                      <Link href="/dashboard/contacts" className="btn btn-primary btn-sm rounded-lg px-3 py-2 text-[10px] font-black uppercase">Zobrazit</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Goal or Inspiration */}
          <div className="card shadow-2xl overflow-hidden group bg-brand-900 text-white" style={{ borderRadius: '2.5rem' }}>
            <div className="p-10 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-700" />
              <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-700">🌲</div>
              <div>
                <h3 className="font-bold text-xl">Kam dál?</h3>
                <p className="text-xs text-brand-200 mt-2 font-medium">Inspiruj se příběhy ostatních nebo začni psát ten svůj!</p>
              </div>
              <Link href="/dashboard/trips/new" className="btn bg-white text-brand-900 hover:bg-brand-50 border-none w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Vytvořit příběh</Link>
            </div>
          </div>

          {/* Trip Statistics */}
          <div className="card shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-brand-800">Tvé statistiky</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform">🏔️</div>
                  <div>
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Aktivní výlety</div>
                    <div className="font-black text-2xl text-brand-950">{myTrips.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-success-100 flex items-center justify-center text-3xl shadow-inner group-hover:-rotate-6 transition-transform">📸</div>
                  <div>
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Celkem zážitků</div>
                    <div className="font-black text-2xl text-brand-950">--</div>
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
