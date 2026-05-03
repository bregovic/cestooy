"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostComposer from "@/components/trips/PostComposer";

interface Trip {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImage: string | null;
  status: string;
  members: any[];
  posts: any[];
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "map" | "expenses">("feed");

  async function loadTrip() {
    try {
      const res = await fetch(`/api/trips/${params.id}`);
      if (!res.ok) throw new Error("Výlet nenalezen");
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      console.error(err);
      // router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) loadTrip();
  }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner w-12 h-12" />
    </div>
  );

  if (!trip) return <div className="text-center py-20">Výlet nebyl nalezen. 🏜️</div>;

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-[40vh] min-h-[300px] rounded-[3rem] overflow-hidden shadow-2xl mb-8 group">
        {trip.coverImage ? (
          <img src={trip.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={trip.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <span className="text-8xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 md:p-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="badge badge-brand bg-white/20 backdrop-blur-md text-white border-white/30 uppercase tracking-widest text-[10px] font-bold">
                  {trip.status === 'ONGOING' ? '🟢 PRÁVĚ PROBÍHÁ' : '📅 PLÁNOVÁNO'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{trip.title}</h1>
              <p className="text-white/80 max-w-xl text-lg font-medium">{trip.description || "Tento příběh zatím nemá popis..."}</p>
            </div>
            <div className="flex -space-x-4">
              {trip.members?.map((m, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-brand-200 shadow-xl" title={m.user.name}>
                  {m.user.avatar ? <img src={m.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{(m.user.name?.[0] || "?")}</div>}
                </div>
              ))}
              <button className="w-12 h-12 rounded-full border-4 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold hover:bg-white/40 transition-colors shadow-xl">
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Post Composer Card */}
          <div className="card shadow-xl overflow-visible" style={{ borderRadius: '2.5rem' }}>
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">✍️</span> Přidat nový zážitek
              </h3>
              <PostComposer 
                tripId={trip.id} 
                onSuccess={() => loadTrip()} 
              />
            </div>
          </div>

          {/* Posts Timeline */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-bold">Časová osa 📜</h2>
              <div className="flex gap-2 bg-muted p-1 rounded-2xl border border-muted-foreground/10">
                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'feed' ? 'bg-white shadow-sm' : 'text-secondary hover:text-primary'}`} onClick={() => setActiveTab('feed')}>Vše</button>
                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-white shadow-sm' : 'text-secondary hover:text-primary'}`} onClick={() => setActiveTab('map')}>Mapa</button>
                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'expenses' ? 'bg-white shadow-sm' : 'text-secondary hover:text-primary'}`} onClick={() => setActiveTab('expenses')}>Výdaje</button>
              </div>
            </div>

            {trip.posts?.length === 0 ? (
              <div className="card py-20 text-center">
                <div className="text-6xl mb-4">🏜️</div>
                <h3 className="text-xl font-bold">Zatím žádné zážitky</h3>
                <p className="text-secondary mt-2">Buďte první a napište, co se na cestě děje!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {trip.posts?.map((post) => (
                  <div key={post.id} className="card shadow-xl overflow-hidden group" style={{ borderRadius: '2.5rem' }}>
                    <div className="p-6 md:p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center shadow-inner">
                            {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full object-cover" /> : <span className="font-bold">{(post.author.name?.[0] || "?")}</span>}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{post.author.name}</div>
                            <div className="text-xs text-secondary flex items-center gap-1">
                              <span>🕒 {new Date(post.createdAt).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              {post.locationName && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="text-brand-500 font-bold flex items-center gap-0.5">
                                    📍 {post.locationName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-icon">•••</button>
                      </div>

                      {post.content && (
                        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                          {post.content}
                        </div>
                      )}

                      {post.mediaUrls?.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 rounded-3xl overflow-hidden">
                          {post.mediaUrls.map((url: string, i: number) => (
                            <img key={i} src={url} className="w-full h-auto object-cover max-h-[600px] hover:scale-[1.02] transition-transform duration-500" alt="Media content" />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-muted/30">
                        <div className="flex gap-6">
                          <button className="flex items-center gap-2 group/like">
                            <span className="text-2xl group-hover/like:scale-125 transition-transform">❤️</span>
                            <span className="font-bold text-secondary">0</span>
                          </button>
                          <button className="flex items-center gap-2 group/comment">
                            <span className="text-2xl group-hover/comment:scale-125 transition-transform">💬</span>
                            <span className="font-bold text-secondary">0</span>
                          </button>
                        </div>
                        <button className="flex items-center gap-2 text-brand-500 font-bold hover:underline">
                          🔖 Uložit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Stats Card */}
          <div className="card shadow-xl overflow-hidden bg-brand-500 text-white" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold">Přehled výletu 📊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Příspěvky</div>
                  <div className="text-3xl font-bold">{trip.posts?.length || 0}</div>
                </div>
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Kilometry</div>
                  <div className="text-3xl font-bold">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="card shadow-xl overflow-hidden" style={{ borderRadius: '2.5rem' }}>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-6">Účastníci 👥</h3>
              <div className="space-y-4">
                {trip.members?.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted group-hover:scale-110 transition-transform">
                      {m.user.avatar ? <img src={m.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{(m.user.name?.[0] || "?")}</div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold group-hover:text-brand-600 transition-colors">{m.user.name}</div>
                      <div className="text-xs text-secondary capitalize">{m.role.toLowerCase()}</div>
                    </div>
                    {m.role === 'ADMIN' && <span className="text-xl" title="Admin">⭐️</span>}
                  </div>
                ))}
              </div>
              <button className="btn btn-outline w-full mt-8 py-4">
                ➕ Pozvat přátele
              </button>
            </div>
          </div>

          {/* Mini Map Placeholder */}
          <div className="card shadow-xl overflow-hidden h-64 relative group" style={{ borderRadius: '2.5rem' }}>
            <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🗺️</div>
              <h4 className="font-bold">Interaktivní mapa</h4>
              <p className="text-xs text-secondary mt-2">Zde se brzy objeví trasa vašeho výletu se všemi check-iny.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
