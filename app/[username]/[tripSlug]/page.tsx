import { prisma } from "@/lib/prisma";
export const revalidate = 60;
import Image from "next/image";
import { notFound } from "next/navigation";
import { calculateExpeditionMileage } from "@/lib/mileage";
import MagazineMap from "@/components/maps/MagazineMap";

interface TripPageProps {
  params: {
    username: string;
    tripSlug: string;
  };
}

const Icons = {
  BLOG: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  ),
  PHOTO: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
  CHECKIN: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  EXPENSE: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  MILEAGE: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
};

export default async function PublicTripPage({ params }: TripPageProps) {
  const { username, tripSlug } = params;

  const trip = await prisma.trip.findFirst({
    where: {
      slug: tripSlug,
      owner: { blogSlug: username },
      isPublic: true
    },
    include: {
      owner: {
        select: { name: true, avatar: true, blogTitle: true, bio: true }
      },
      posts: {
        orderBy: { loggedAt: "desc" }
      }
    }
  });

  if (!trip) notFound();

  // Calculate smart mileage (reverse logic handled by helper if needed, or just reverse results)
  const enrichedPosts = calculateExpeditionMileage([...trip.posts].reverse() as any).reverse();
  
  // Prepare map points (all points for the main map)
  const mapPoints = enrichedPosts
    .filter(p => p.lat !== null && p.lng !== null)
    .map(p => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      locationName: p.locationName,
      type: p.type
    }));

  const latestPostWithLoc = [...enrichedPosts].find(p => p.lat && p.lng);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative h-[90vh] w-full overflow-hidden flex items-end">
        {trip.coverImage ? (
          <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-brand-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24 w-full flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-200">Live Expedice</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              {trip.title}
            </h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl border-2 border-white/20 overflow-hidden bg-brand-800 flex items-center justify-center font-bold shadow-2xl">
                   {trip.owner.avatar ? (
                     <Image src={trip.owner.avatar} alt={trip.owner.name} width={48} height={48} className="object-cover" />
                   ) : trip.owner.name[0]}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">Zaznamenává</span>
                   <span className="text-sm font-bold">{trip.owner.name}</span>
                 </div>
               </div>
               <div className="h-8 w-px bg-white/20" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">Start cesty</span>
                 <span className="text-sm font-bold">
                   {trip.startDate ? new Date(trip.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' }) : 'Právě teď'}
                 </span>
               </div>
            </div>
          </div>

          {/* Current Location Mini Map Card like in Questea */}
          {latestPostWithLoc && (
            <div className="w-full md:w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-fade-in-up">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Aktuálně</span>
               </div>
               <div className="h-32 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 relative">
                  <MagazineMap points={[{ ...latestPostWithLoc, lat: latestPostWithLoc.lat!, lng: latestPostWithLoc.lng! }]} isMini />
               </div>
               <div className="space-y-1">
                 <div className="text-white font-black text-sm truncate uppercase tracking-tight">
                   {latestPostWithLoc.locationName?.split(',')[0] || "Na cestě"}
                 </div>
                 <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                   {new Date(latestPostWithLoc.loggedAt).toLocaleString("cs-CZ", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Map Section */}
      <div className="h-[60vh] w-full border-y border-brand-100 relative z-20">
        <MagazineMap points={mapPoints} />
      </div>

      {/* Story Content */}
      <section className="max-w-4xl mx-auto px-6 py-32">
        {trip.description && (
          <div className="text-3xl md:text-4xl font-bold text-brand-950 leading-tight mb-32 max-w-2xl">
            {trip.description}
          </div>
        )}

        <div className="space-y-48">
          {enrichedPosts.map((post: any, idx: number) => {
            const date = new Date(post.loggedAt);
            return (
              <article key={post.id} className="relative">
                {/* Timeline Number */}
                <div className="absolute -left-20 top-0 text-[10px] font-black text-brand-100 hidden lg:block tracking-[0.5em] rotate-90 origin-left">
                  MOMENT / {enrichedPosts.length - idx}
                </div>
                
                <div className="space-y-12">
                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="px-5 py-2.5 bg-brand-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl">
                      {post.type === "PHOTO" && <Icons.PHOTO className="w-3.5 h-3.5" />}
                      {post.type === "CHECKIN" && <Icons.CHECKIN className="w-3.5 h-3.5" />}
                      {post.type === "EXPENSE" && <Icons.EXPENSE className="w-3.5 h-3.5" />}
                      {post.type === "MILEAGE" && <Icons.MILEAGE className="w-3.5 h-3.5" />}
                      {post.type === "BLOG" && <Icons.BLOG className="w-3.5 h-3.5" />}
                      {date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      <span className="opacity-30">|</span>
                      {date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                    </div>

                    {(post.locationName || post.displayMileage) && (
                      <div className="flex flex-wrap gap-2">
                        {post.locationName && (
                          <div className="px-4 py-2.5 bg-brand-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-brand-600 flex items-center gap-2 border border-brand-100/50">
                            <Icons.CHECKIN className="w-3.5 h-3.5" /> {post.locationName.split(',')[0]}
                          </div>
                        )}
                        {post.displayMileage && (
                          <div className="px-4 py-2.5 bg-orange-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-2 border border-orange-100/50">
                            <Icons.MILEAGE className="w-3.5 h-3.5" /> {post.displayMileage.toLocaleString()} KM
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Multi-Media Gallery */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={`grid gap-4 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {post.mediaUrls.map((url: string, i: number) => (
                        <div 
                          key={i} 
                          className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all duration-700 ${
                            post.mediaUrls.length === 3 && i === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                          }`}
                        >
                          {url.includes("video") || url.startsWith("data:video") ? (
                            <video src={url} className="w-full h-full object-cover" controls />
                          ) : (
                            <Image src={url} alt="Story moment" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {post.content && (
                    <div className="text-xl md:text-3xl text-brand-950 leading-relaxed font-medium whitespace-pre-wrap max-w-2xl">
                      {post.content}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Author Footer */}
      <footer className="bg-brand-950 py-48 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-500 rounded-full blur-[200px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <div className="w-32 h-32 rounded-[3rem] bg-white p-2 mx-auto mb-10 -rotate-6 shadow-2xl">
             <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-brand-950 flex items-center justify-center text-2xl font-bold">
                {trip.owner.avatar ? (
                  <Image src={trip.owner.avatar} alt={trip.owner.name} width={128} height={128} className="object-cover" />
                ) : trip.owner.name[0]}
             </div>
           </div>
           <h3 className="text-3xl font-black uppercase tracking-tight mb-6">Tuto cestu pro vás napsal {trip.owner.name}</h3>
           <p className="text-brand-300 font-bold text-xs uppercase tracking-[0.2em] max-w-lg mx-auto mb-12 leading-relaxed opacity-60">
             {trip.owner.bio || "Dobrodruh tělem i duší."}
           </p>
           
           <div className="flex justify-center gap-6">
              <Link href={`/${username}`} className="bg-white text-brand-950 px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Navštívit profil autora</Link>
           </div>
        </div>
      </footer>
    </main>
  );
}
