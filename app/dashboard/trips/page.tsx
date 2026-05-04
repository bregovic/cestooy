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
    <div className="page-content animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-950 uppercase tracking-tight">Moje Akce 📅</h1>
          <p className="text-secondary mt-2 font-medium">Ucelené příběhy a společné zážitky z tvých cest.</p>
        </div>
        <Link href="/dashboard/trips/new" className="btn btn-primary px-10 py-5 rounded-[2rem] shadow-xl shadow-brand-200 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest">
          ➕ Vytvořit novou akci
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="card py-32 text-center bg-white/50 backdrop-blur-xl border-dashed border-2 border-brand-200" style={{ borderRadius: '3rem' }}>
          <div className="text-8xl mb-6 grayscale opacity-40">🎒</div>
          <h2 className="text-2xl font-black text-brand-900 uppercase tracking-widest">Zatím tu žádná akce není</h2>
          <p className="text-secondary mt-3 max-w-md mx-auto font-medium">
            Začni plánovat svůj první velký příběh nebo skupinový výlet právě teď!
          </p>
          <Link href="/dashboard/trips/new" className="btn btn-primary mt-10 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest">
            Naplánovat první akci 🚀
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <Link 
              key={trip.id} 
              href={`/dashboard/trips/${trip.id}`}
              className="group flex flex-col bg-white rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                {trip.coverImage ? (
                  <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={trip.title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">🏕️</div>
                )}
                <div className="absolute top-6 right-6">
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${
                    trip.status === 'ONGOING' ? 'bg-green-500 text-white' : 
                    trip.status === 'PLANNING' ? 'bg-brand-500 text-white' : 
                    'bg-slate-500 text-white'
                  }`}>
                    {trip.status === 'ONGOING' ? '🟢 Probíhá' : 
                     trip.status === 'PLANNING' ? '📅 V plánu' : '🏁 Hotovo'}
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString('cs-CZ') : 'Datum neurčeno'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-brand-950 mb-3 group-hover:text-brand-600 transition-colors">{trip.title}</h3>
                <p className="text-secondary text-sm font-medium line-clamp-2 mb-8 flex-1">
                  {trip.description || "Tato akce zatím nemá popis..."}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-brand-50 mt-auto">
                  <div className="flex -space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 border-2 border-white flex items-center justify-center text-xs font-black shadow-sm" title={trip.owner.name}>
                      {trip.owner.avatar ? <img src={trip.owner.avatar} className="w-full h-full object-cover" /> : trip.owner.name[0]}
                    </div>
                    {trip._count.members > 1 && (
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-brand-400 shadow-sm">
                        +{trip._count.members - 1}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-brand-950">{trip._count.posts}</span>
                      <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Zážitků</span>
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
