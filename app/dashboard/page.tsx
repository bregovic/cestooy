import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import PostComposer from "@/components/trips/PostComposer";
import DashboardFeed from "@/components/social/DashboardFeed";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cestooy | Moje Zeď",
};

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    // Fetch essential data for dashboard with safety catches
    const myTrips = await prisma.trip.findMany({
      where: { 
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ],
        status: "ONGOING"
      },
      orderBy: { updatedAt: 'desc' },
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
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-950">Ahoj, {firstName}! 🌍</h1>
                <p className="text-secondary mt-1 font-bold italic opacity-70 tracking-wide">Tvé dobrodružství pokračuje...</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/trips/new" className="btn btn-primary px-8 py-4 shadow-xl shadow-brand-200 hover:scale-105 transition-all rounded-2xl font-black text-xs uppercase tracking-widest">
                  ➕ Nový výlet
                </Link>
              </div>
            </div>

            {/* Quick Check-in / Post Area */}
            <div className="card shadow-2xl border-none bg-white/70 backdrop-blur-xl ring-1 ring-white p-8 overflow-visible" style={{ borderRadius: '2.5rem' }}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400 mb-6 ml-2">Rychlý check-in</h3>
              <PostComposer />
            </div>

            {/* Ongoing Trips - "Stories" Look */}
            {myTrips.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-800">Právě prožíváš</h2>
                  <Link href="/dashboard/trips" className="text-[10px] font-black text-brand-500 hover:underline uppercase tracking-widest">Všechny výlety →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myTrips.map(trip => (
                    <Link key={trip.id} href={`/dashboard/trips/${trip.id}`} className="group relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ring-1 ring-white/50">
                      {trip.coverImage ? (
                        <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={trip.title} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">🎒</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <div className="text-white font-black text-lg leading-tight group-hover:translate-x-1 transition-transform">{trip.title}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-white/60 text-[10px] uppercase font-black tracking-widest">AKTIVNÍ</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Feed Area */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-brand-950 flex items-center gap-3">
                  Nástěnka zážitků <span className="text-sm px-3 py-1 bg-brand-100 text-brand-600 rounded-full font-black uppercase tracking-widest">Live</span>
                </h2>
              </div>
              <DashboardFeed />
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Friend Requests Widget */}
            {friendRequests.length > 0 && (
              <div className="card bg-brand-50 border-brand-100 shadow-xl overflow-hidden" style={{ borderRadius: '2.5rem' }}>
                <div className="p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-6">Nové žádosti ({friendRequests.length})</h3>
                  <div className="space-y-4">
                    {friendRequests.map(req => (
                      <div key={req.id} className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white transition-all hover:shadow-md hover:bg-white group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center ring-2 ring-brand-100 group-hover:ring-brand-400 transition-all">
                          {req.requester.avatar ? (
                            <img src={req.requester.avatar} className="w-full h-full object-cover" alt={req.requester.name} />
                          ) : (
                            <span className="font-black text-brand-600">{(req.requester.name?.[0] || "?")}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black truncate text-brand-950">{req.requester.name}</div>
                          <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">Chce tě sledovat</div>
                        </div>
                        <Link href="/dashboard/contacts" className="btn btn-primary btn-sm rounded-lg px-4 py-2 text-[9px] font-black uppercase">Zobrazit</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Foursquare-style Exploration Box */}
            <div className="card shadow-2xl overflow-hidden group bg-brand-950 text-white" style={{ borderRadius: '2.5rem' }}>
              <div className="p-10 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-400 transition-all duration-700 opacity-30" />
                <div className="text-7xl mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 drop-shadow-2xl">🌲</div>
                <div>
                  <h3 className="font-black text-2xl uppercase tracking-widest">Kam dál?</h3>
                  <p className="text-xs text-brand-200 mt-3 font-medium leading-relaxed">Inspiruj se příběhy ostatních nebo začni psát ten svůj!</p>
                </div>
                <Link href="/dashboard/trips/new" className="btn bg-white text-brand-950 hover:bg-brand-50 border-none w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl">Začít Trip 🚀</Link>
              </div>
            </div>

            {/* Travel Stats Widget */}
            <div className="card shadow-2xl overflow-hidden bg-white/40 backdrop-blur-md border border-white ring-1 ring-brand-50" style={{ borderRadius: '2.5rem' }}>
              <div className="p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-brand-800">Tvé cestovatelské skóre</h3>
                <div className="space-y-8">
                  <div className="flex items-center gap-5 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-100 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform duration-500">🌏</div>
                    <div>
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Zemí navštíveno</div>
                      <div className="font-black text-3xl text-brand-950 tracking-tight">--</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-success-100 flex items-center justify-center text-4xl shadow-inner group-hover:-rotate-12 transition-transform duration-500">📸</div>
                    <div>
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Zážitků na zdi</div>
                      <div className="font-black text-3xl text-brand-950 tracking-tight">--</div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-brand-50 text-center">
                   <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Brzy: Cestovatelské odznaky 🏅</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return (
      <div className="p-10 bg-red-50 text-red-900 border-2 border-red-200 rounded-[2.5rem] m-8 shadow-2xl animate-shake">
        <h1 className="text-3xl font-black mb-6 uppercase tracking-widest">⚠️ Systémová porucha</h1>
        <p className="font-bold mb-4">Něco se pokazilo při načítání tvého dashboardu. Tady je stopa pro technika:</p>
        <pre className="p-6 bg-brand-950 text-brand-50 rounded-[2rem] overflow-auto text-xs font-mono shadow-inner border border-white/10">
          {error.message}
        </pre>
        <div className="mt-8 flex gap-4">
           <button onClick={() => window.location.reload()} className="btn btn-primary px-8 py-3 rounded-xl font-bold">Zkusit znovu 🔄</button>
           <Link href="/dashboard/settings" className="btn btn-ghost px-8 py-3 rounded-xl font-bold">Nastavení ⚙️</Link>
        </div>
      </div>
    );
  }
}
