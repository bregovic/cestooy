import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } }
      ]
    },
    include: {
      _count: {
        select: { members: true, posts: true }
      },
      owner: { select: { name: true, avatar: true } }
    },
    orderBy: { updatedAt: "desc" }
  }).catch(() => []);

  return (
    <div className="page-content animate-fade-in max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-300">Moje expedice</span>
          </div>
          <h1 className="text-4xl font-black text-brand-950 uppercase tracking-tight leading-none">Akce a Plány</h1>
        </div>
        <Link href="/dashboard/trips/new" className="bg-brand-950 text-white px-8 py-4 rounded-2xl shadow-xl shadow-brand-950/10 hover:scale-[1.02] active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span>Vytvořit novou akci</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white/30 border-2 border-dashed border-brand-100 rounded-[3rem] py-32 text-center px-6">
          <div className="text-5xl mb-6 grayscale opacity-20">🏕️</div>
          <h2 className="text-xl font-black text-brand-900 uppercase tracking-widest">Zatím tu žádná akce není</h2>
          <p className="text-brand-400 mt-3 max-w-sm mx-auto font-bold text-[11px] uppercase tracking-widest leading-relaxed">
            Začni plánovat svůj první příběh nebo společný výlet právě teď!
          </p>
          <Link href="/dashboard/trips/new" className="inline-block mt-10 bg-brand-50 hover:bg-brand-100 text-brand-600 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
            Naplánovat první akci
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {trips.map((trip) => (
            <Link 
              key={trip.id} 
              href={`/dashboard/trips/${trip.id}`}
              className="group flex flex-col bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-brand-50"
            >
              <div className="relative h-60 overflow-hidden">
                {trip.coverImage ? (
                  <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={trip.title} />
                ) : (
                  <div className="w-full h-full bg-brand-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-1000">🗺️</div>
                )}
                <div className="absolute top-6 left-6">
                  <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20 flex items-center gap-2 ${
                    trip.status === 'ONGOING' ? 'bg-green-500 text-white' : 
                    trip.status === 'PLANNING' ? 'bg-brand-950 text-white' : 
                    'bg-slate-400 text-white'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${trip.status === 'ONGOING' ? 'animate-pulse' : ''}`} />
                    {trip.status === 'ONGOING' ? 'Probíhá' : 
                     trip.status === 'PLANNING' ? 'V plánu' : 'Hotovo'}
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-brand-300 uppercase tracking-[0.2em]">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Termín neurčen'}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-brand-950 mb-3 group-hover:text-brand-600 transition-colors leading-tight">{trip.title}</h3>
                <p className="text-brand-400 text-[13px] font-bold leading-relaxed line-clamp-2 mb-8 flex-1">
                  {trip.description || "Tato akce zatím nemá popis..."}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-brand-50 mt-auto">
                  <div className="flex -space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 border-2 border-white flex items-center justify-center text-xs font-black shadow-sm overflow-hidden" title={trip.owner.name}>
                      {trip.owner.avatar ? <img src={trip.owner.avatar} className="w-full h-full object-cover" /> : trip.owner.name[0]}
                    </div>
                    {trip._count.members > 1 && (
                      <div className="w-9 h-9 rounded-xl bg-brand-50 border-2 border-white flex items-center justify-center text-[9px] font-black text-brand-400 shadow-sm">
                        +{trip._count.members - 1}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-brand-950">{trip._count.posts}</span>
                      <span className="text-[8px] font-black text-brand-300 uppercase tracking-widest">Střípků</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
