import { prisma } from "@/lib/prisma";
export const revalidate = 60;
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MagazineMap from "@/components/maps/MagazineMap";

interface UserProfileProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: UserProfileProps) {
  const { username } = params;

  // Najít uživatele a jeho veřejné výlety
  const user = await prisma.user.findUnique({
    where: { blogSlug: username },
    include: {
      ownedTrips: {
        where: { isPublic: true },
        include: {
          _count: { select: { posts: true } }
        },
        orderBy: { startDate: "desc" }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Získat všechny GPS body uživatele pro globální mapu
  const allPosts = await prisma.tripPost.findMany({
    where: {
      authorId: user.id,
      lat: { not: null },
      lng: { not: null },
      trip: { isPublic: true }
    },
    select: { id: true, lat: true, lng: true, locationName: true, type: true },
    orderBy: { loggedAt: "asc" }
  });

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Profile Header */}
      <header className="bg-brand-50/50 py-24 border-b border-brand-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white border border-brand-100 p-2 rotate-3 shadow-xl">
             <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-brand-950 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={160} height={160} className="object-cover h-full" />
                ) : user.name[0]}
             </div>
           </div>
           
           <div className="flex-1 text-center md:text-left space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-brand-950 uppercase tracking-tight leading-none">
                {user.blogTitle || user.name}
              </h1>
              <p className="text-brand-400 font-bold text-sm md:text-lg uppercase tracking-widest leading-relaxed max-w-2xl">
                {user.bio || "Milovník dobrodružství a dobrých příběhů, který mapuje své cesty světem."}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-brand-950 leading-none">{user.ownedTrips.length}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-300 mt-2">Expedic</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-brand-950 leading-none">
                      {allPosts.length}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-300 mt-2">Zastávek</span>
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* Global Map Section */}
      {allPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 -mt-12 mb-24 relative z-10">
           <div className="h-[400px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <MagazineMap points={allPosts as any} />
           </div>
        </section>
      )}

      {/* Public Trips Grid */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
           <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-300">Sbírka mých příběhů</h2>
        </div>

        {user.ownedTrips.length === 0 ? (
          <div className="py-20 text-center bg-brand-50/20 rounded-[3rem] border-2 border-dashed border-brand-100">
             <p className="text-brand-300 font-bold uppercase tracking-widest text-xs">Zatím tu žádné veřejné akce nejsou</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {user.ownedTrips.map((trip) => (
              <Link 
                key={trip.id} 
                href={`/${username}/${trip.slug}`}
                className="group flex flex-col bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-brand-50"
              >
                <div className="relative h-64 overflow-hidden">
                  {trip.coverImage ? (
                    <Image src={trip.coverImage} alt={trip.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full bg-brand-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-1000">🗺️</div>
                  )}
                  <div className="absolute top-6 left-6">
                    <div className="px-4 py-2 rounded-2xl bg-brand-950 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                      {trip.startDate ? new Date(trip.startDate).getFullYear() : "Aktuální"}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-brand-950 mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                    {trip.title}
                  </h3>
                  <div className="flex items-center justify-between pt-6 border-t border-brand-50 mt-4">
                     <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">
                       {trip._count.posts} Momentů
                     </span>
                     <span className="text-brand-950 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                       Číst příběh →
                     </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-32 text-center">
         <Link href="/" className="inline-flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Běží na</span>
            <Image src="/logo.png" alt="Cestooy" width={80} height={25} className="h-auto w-auto" />
         </Link>
      </footer>
    </main>
  );
}
