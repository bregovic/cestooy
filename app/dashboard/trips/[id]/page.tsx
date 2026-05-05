"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PostComposer from "@/components/trips/PostComposer";
import Image from "next/image";

interface Trip {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImage: string | null;
  status: string;
  isPublic: boolean;
  owner: {
    name: string;
    avatar: string | null;
    blogSlug: string | null;
  };
  members: any[];
  posts: any[];
}

const Icons = {
  BLOG: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  ),
  PHOTO: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
  CHECKIN: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  EXPENSE: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  MILEAGE: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
};

export default function TripDetailPage() {
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTrip() {
    try {
      const res = await fetch(`/api/trips/${params.id}`);
      if (!res.ok) throw new Error("Výlet nenalezen");
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) loadTrip();
  }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  if (!trip) return <div className="text-center py-24 font-black uppercase tracking-widest text-brand-300">Výlet nenalezen 🏜️</div>;

  const publicLink = trip.owner.blogSlug && trip.slug ? `/${trip.owner.blogSlug}/${trip.slug}` : null;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto py-6 px-4">
      {/* Hero Header */}
      <div className="relative h-[45vh] min-h-[350px] rounded-[3rem] overflow-hidden shadow-2xl mb-12 group">
        {trip.coverImage ? (
          <Image src={trip.coverImage} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" alt={trip.title} />
        ) : (
          <div className="w-full h-full bg-brand-950 flex items-center justify-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-14">
          <div className="max-w-4xl space-y-4">
             <div className="flex flex-wrap items-center gap-3">
               <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20">
                 {trip.status === 'ONGOING' ? '🟢 Probíhá' : '📅 Plánováno'}
               </span>
               {trip.isPublic && publicLink && (
                 <Link href={publicLink} target="_blank" className="px-4 py-1.5 bg-brand-400 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-300 transition-colors shadow-lg">
                   🌍 Veřejný blog
                 </Link>
               )}
             </div>
             <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl">
               {trip.title}
             </h1>
             <p className="text-white/70 max-w-2xl text-sm md:text-lg font-medium leading-relaxed">
               {trip.description || "Tento příběh zatím nemá popis..."}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-12">
          
          <PostComposer tripId={trip.id} onSuccess={() => loadTrip()} />

          <div className="space-y-10">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-brand-950 uppercase tracking-tight">Kronika výletu</h2>
              <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">{trip.posts?.length || 0} záznamů</span>
            </div>

            {trip.posts?.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-brand-100 rounded-[2.5rem] py-24 text-center">
                <div className="text-5xl mb-4 opacity-20">🏜️</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-400">Zatím žádné zážitky</h3>
              </div>
            ) : (
              <div className="relative pl-10 md:pl-14 space-y-12 pb-20">
                <div className="absolute left-[19px] md:left-[27px] top-4 bottom-4 w-[1.5px] bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" />
                
                {trip.posts?.map((post) => (
                  <article key={post.id} className="relative group">
                    <div className="absolute -left-[35px] md:-left-[43px] top-0 w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-white border border-brand-100 shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                       <div className={`p-2 rounded-xl ${
                          post.type === "PHOTO" ? "bg-purple-50 text-purple-600" :
                          post.type === "CHECKIN" ? "bg-blue-50 text-blue-600" :
                          post.type === "EXPENSE" ? "bg-emerald-50 text-emerald-600" :
                          post.type === "MILEAGE" ? "bg-orange-50 text-orange-600" :
                          "bg-brand-50 text-brand-600"
                        }`}>
                          {post.type === "PHOTO" && <Icons.PHOTO className="w-4 h-4" />}
                          {post.type === "CHECKIN" && <Icons.CHECKIN className="w-4 h-4" />}
                          {post.type === "EXPENSE" && <Icons.EXPENSE className="w-4 h-4" />}
                          {post.type === "MILEAGE" && <Icons.MILEAGE className="w-4 h-4" />}
                          {post.type === "BLOG" && <Icons.BLOG className="w-4 h-4" />}
                       </div>
                    </div>

                    <div className="bg-white border border-brand-100 rounded-[2.5rem] shadow-sm overflow-hidden p-6 md:p-8 space-y-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-[10px] font-black text-brand-600 overflow-hidden shadow-sm">
                             {post.author.avatar ? <Image src={post.author.avatar} alt={post.author.name} width={36} height={36} className="object-cover h-full" /> : post.author.name[0]}
                           </div>
                           <div>
                             <div className="text-[11px] font-black text-brand-950 uppercase tracking-tight">{post.author.name}</div>
                             <div className="text-[9px] text-brand-400 font-bold uppercase tracking-widest">
                               {new Date(post.loggedAt).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </div>
                           </div>
                         </div>
                      </div>

                      {post.mediaUrls?.length > 0 && (
                        <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-brand-50">
                           <Image src={post.mediaUrls[0]} alt="Moment" fill className="object-cover" />
                        </div>
                      )}

                      {(post.amount || post.mileage || post.locationName) && (
                        <div className="flex flex-wrap gap-2.5">
                          {post.locationName && (
                            <div className="flex items-center gap-2 bg-blue-50/40 text-blue-700 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/30">
                              <Icons.CHECKIN className="w-3.5 h-3.5" /> {post.locationName.split(',')[0]}
                            </div>
                          )}
                          {post.amount && (
                            <div className="flex items-center gap-2 bg-emerald-50/40 text-emerald-700 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100/30">
                              <Icons.EXPENSE className="w-3.5 h-3.5" /> {post.amount.toLocaleString()} CZK
                            </div>
                          )}
                          {post.mileage && (
                            <div className="flex items-center gap-2 bg-orange-50/40 text-orange-700 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100/30">
                              <Icons.MILEAGE className="w-3.5 h-3.5" /> {post.mileage.toLocaleString()} km
                            </div>
                          )}
                        </div>
                      )}

                      {post.content && (
                        <p className="text-sm md:text-base text-brand-950 leading-relaxed font-medium">
                          {post.content}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           {/* Stats Widget */}
           <div className="bg-brand-950 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-60 transition-opacity" />
              <h3 className="text-xl font-black uppercase tracking-tight relative z-10">Expediční data</h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-3xl font-black mb-1">{trip.posts?.length || 0}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-brand-300">Zážitků</div>
                 </div>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-3xl font-black mb-1">{trip.members?.length || 0}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-brand-300">Účastníků</div>
                 </div>
              </div>
           </div>

           {/* Members Widget */}
           <div className="bg-white border border-brand-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-300">Posádka</h3>
              <div className="space-y-4">
                 {trip.members?.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 overflow-hidden shadow-sm flex items-center justify-center">
                          {m.user.avatar ? <Image src={m.user.avatar} alt={m.user.name} width={40} height={40} className="object-cover" /> : <span className="text-xs font-black text-brand-400">{m.user.name[0]}</span>}
                       </div>
                       <div>
                          <div className="text-xs font-black text-brand-950 uppercase tracking-tight">{m.user.name}</div>
                          <div className="text-[9px] font-black text-brand-300 uppercase tracking-widest">{m.role}</div>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all mt-4 border border-brand-100/30">
                 Pozvat do posádky
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
