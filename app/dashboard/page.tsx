import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import PostComposer from "@/components/trips/PostComposer";
import DashboardFeed from "@/components/social/DashboardFeed";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cestooy",
};

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    const myTrips = await prisma.trip.findMany({
      where: { 
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ],
        status: "ONGOING"
      },
      orderBy: { updatedAt: 'desc' },
      take: 4
    }).catch(() => []);

    const friendRequests = await prisma.friendship.findMany({
      where: { addresseeId: user.id, status: "PENDING" },
      include: { requester: { select: { name: true, avatar: true } } }
    }).catch(() => []);

    return (
      <div className="animate-fade-in max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Check-in Area - Modern & Clean */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-brand-100/50 p-6">
              <PostComposer />
            </div>

            {/* Stories / Ongoing Trips - Clean Instagram Style */}
            {myTrips.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-400">Právě prožíváš</h2>
                  <Link href="/dashboard/trips" className="text-[10px] font-bold text-brand-600 hover:text-brand-950 transition-colors">Všechny akce →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myTrips.map(trip => (
                    <Link key={trip.id} href={`/dashboard/trips/${trip.id}`} className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      {trip.coverImage ? (
                        <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={trip.title} />
                      ) : (
                        <div className="w-full h-full bg-brand-50 flex items-center justify-center text-3xl">🏞️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                        <div className="text-white font-bold text-sm truncate">{trip.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-white/70 text-[9px] font-black tracking-widest">LIVE</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Feed - The Core Content */}
            <div className="space-y-6 pt-4">
              <DashboardFeed />
            </div>

          </div>

          {/* Sidebar Column - Clean X/Foursquare Style */}
          <div className="lg:col-span-4 space-y-8 sticky top-24 h-fit">
            
            {/* Friend Requests Widget */}
            {friendRequests.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-brand-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-6 px-1">Nové žádosti ({friendRequests.length})</h3>
                  <div className="space-y-4">
                    {friendRequests.map(req => (
                      <div key={req.id} className="flex items-center gap-4 bg-brand-50/30 p-4 rounded-2xl border border-brand-50/50 hover:bg-white hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                          {req.requester.avatar ? (
                            <img src={req.requester.avatar} className="w-full h-full object-cover" alt={req.requester.name} />
                          ) : (
                            <div className="w-full h-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 text-xs">{(req.requester.name?.[0] || "?")}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate text-brand-950">{req.requester.name}</div>
                          <div className="text-[9px] text-secondary font-medium tracking-wide">Chce tě sledovat</div>
                        </div>
                        <Link href="/dashboard/contacts" className="bg-brand-950 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:scale-105 transition-all">OK</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Travel Stats Widget */}
            <div className="bg-white rounded-[2rem] border border-brand-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-8">Tvůj profil</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-50/50 p-6 rounded-3xl text-center">
                    <div className="text-2xl mb-2">🌏</div>
                    <div className="font-black text-2xl text-brand-950 tracking-tight">0</div>
                    <div className="text-[8px] font-black text-brand-400 uppercase tracking-widest mt-1">Zemí</div>
                  </div>
                  <div className="bg-brand-50/50 p-6 rounded-3xl text-center">
                    <div className="text-2xl mb-2">📸</div>
                    <div className="font-black text-2xl text-brand-950 tracking-tight">0</div>
                    <div className="text-[8px] font-black text-brand-400 uppercase tracking-widest mt-1">Zážitků</div>
                  </div>
                </div>
                <Link href="/dashboard/settings" className="mt-6 w-full py-4 border border-brand-100 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-50 transition-all">
                  Upravit profil ⚙️
                </Link>
              </div>
            </div>

            {/* Foursquare-style Exploration Link */}
            <Link href="/dashboard/trips/new" className="block group relative bg-brand-950 rounded-[2rem] overflow-hidden p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight uppercase">Nová Akce</h3>
                  <p className="text-brand-300 text-[10px] font-medium mt-1">Naplánuj svůj další příběh</p>
                </div>
                <div className="text-3xl group-hover:scale-125 transition-transform">🚀</div>
              </div>
            </Link>

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
           <Link href="/dashboard" className="btn btn-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-200">
             Zkusit znovu 🔄
           </Link>
           <Link href="/dashboard/settings" className="btn btn-ghost px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
             Nastavení ⚙️
           </Link>
        </div>
      </div>
    );
  }
}
