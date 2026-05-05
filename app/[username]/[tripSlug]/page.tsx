import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

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

  // Najít výlet podle slugu a ověřit uživatele
  const trip = await prisma.trip.findFirst({
    where: {
      slug: tripSlug,
      owner: {
        blogSlug: username
      },
      isPublic: true // Blog zobrazujeme jen u veřejných akcí
    },
    include: {
      owner: {
        select: {
          name: true,
          avatar: true,
          blogTitle: true,
          bio: true
        }
      },
      posts: {
        orderBy: {
          loggedAt: "asc" // Blog vyprávíme od začátku
        }
      }
    }
  });

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative h-[80vh] w-full overflow-hidden flex items-end">
        {trip.coverImage ? (
          <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-brand-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full text-white">
          <div className="flex items-center gap-3 mb-6 animate-slide-up">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-200">Expedice</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6 animate-slide-up">
            {trip.title}
          </h1>
          <div className="flex items-center gap-6 animate-slide-up delay-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden">
                 {trip.owner.avatar ? (
                   <Image src={trip.owner.avatar} alt={trip.owner.name} width={40} height={40} />
                 ) : (
                   <div className="w-full h-full bg-brand-800 flex items-center justify-center font-bold">{trip.owner.name[0]}</div>
                 )}
               </div>
               <span className="text-sm font-bold">{trip.owner.name}</span>
             </div>
             <div className="h-4 w-px bg-white/20" />
             <span className="text-sm font-medium opacity-70">
               {trip.startDate ? new Date(trip.startDate).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long' }) : 'Probíhající cesta'}
             </span>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <section className="max-w-3xl mx-auto px-6 py-24 space-y-32">
        
        {/* Intro */}
        {trip.description && (
          <div className="text-2xl font-medium text-brand-950 leading-relaxed italic border-l-4 border-brand-100 pl-8">
            "{trip.description}"
          </div>
        )}

        {/* Timeline Posts */}
        <div className="space-y-40">
          {trip.posts.map((post, idx) => (
            <article key={post.id} className="relative group">
              {/* Day Marker */}
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-brand-100 hidden lg:block" />
              
              <div className="space-y-10">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-4 py-2 bg-brand-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-600 flex items-center gap-2">
                    {post.type === "PHOTO" && <Icons.PHOTO className="w-3.5 h-3.5" />}
                    {post.type === "CHECKIN" && <Icons.CHECKIN className="w-3.5 h-3.5" />}
                    {post.type === "EXPENSE" && <Icons.EXPENSE className="w-3.5 h-3.5" />}
                    {post.type === "MILEAGE" && <Icons.MILEAGE className="w-3.5 h-3.5" />}
                    {post.type === "BLOG" && <Icons.BLOG className="w-3.5 h-3.5" />}
                    {new Date(post.loggedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {(post.amount || post.mileage || post.locationName) && (
                    <div className="flex flex-wrap gap-2">
                      {post.locationName && (
                        <div className="px-3 py-2 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-600">
                          📍 {post.locationName.split(',')[0]}
                        </div>
                      )}
                      {post.amount && (
                        <div className="px-3 py-2 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-600">
                          💰 {post.amount.toString()} CZK
                        </div>
                      )}
                      {post.mileage && (
                        <div className="px-3 py-2 border border-orange-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-orange-600">
                          ⛽ {post.mileage} KM
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="relative aspect-[16/10] w-full rounded-[2rem] overflow-hidden shadow-2xl">
                    <Image src={post.mediaUrls[0]} alt="Story moment" fill className="object-cover" />
                  </div>
                )}

                {/* Text */}
                {post.content && (
                  <div className="text-lg md:text-xl text-brand-950 leading-relaxed font-medium whitespace-pre-wrap">
                    {post.content}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer / Author Card */}
      <footer className="bg-brand-50/50 py-32 border-t border-brand-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <div className="w-24 h-24 rounded-[2rem] bg-white border border-brand-100 p-2 mx-auto mb-8 rotate-3 shadow-lg">
             <div className="w-full h-full rounded-2xl overflow-hidden">
                {trip.owner.avatar ? (
                  <Image src={trip.owner.avatar} alt={trip.owner.name} width={96} height={96} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-950 flex items-center justify-center text-2xl font-bold text-white">{trip.owner.name[0]}</div>
                )}
             </div>
           </div>
           <h3 className="text-2xl font-black text-brand-950 uppercase tracking-tight mb-4">Sledovali jste cestu: {trip.owner.name}</h3>
           <p className="text-brand-400 font-medium max-w-md mx-auto mb-10 leading-relaxed">{trip.owner.bio || "Milovník dobrodružství a dobrých příběhů."}</p>
           
           <div className="flex justify-center gap-4">
              <Link href={`/${username}`} className="bg-brand-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-950/20 hover:scale-105 transition-all">Sledovat autora</Link>
           </div>
        </div>
      </footer>
    </main>
  );
}

// Nav Link for SSR
import Link from "next/link";
