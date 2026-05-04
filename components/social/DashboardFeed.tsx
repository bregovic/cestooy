"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  id: string;
  content: string | null;
  mediaUrls: string[];
  locationName: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  trip?: {
    id: string;
    title: string;
  } | null;
}

export default function DashboardFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/posts")
      .then(res => res.json())
      .then(data => {
        // API returns { posts: [...] }
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse h-64 bg-muted/30" style={{ borderRadius: '2.5rem' }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card py-32 text-center bg-white/50 backdrop-blur-xl border-dashed border-2 border-brand-200" style={{ borderRadius: '3rem' }}>
        <div className="text-8xl mb-6 grayscale opacity-40">🌵</div>
        <h2 className="text-2xl font-black text-brand-900 uppercase tracking-widest">Tvá osa je prázdná</h2>
        <p className="text-secondary mt-3 max-w-md mx-auto font-medium">
          Zaznamenej svůj první check-in nebo se podívej, co dělají tví přátelé!
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 md:pl-16 space-y-12 pb-20">
      {/* Vertical Timeline Line */}
      <div className="absolute left-[15px] md:left-[31px] top-4 bottom-0 w-1.5 bg-gradient-to-b from-brand-300 via-brand-100 to-transparent rounded-full opacity-50" />

      {posts.map((post, index) => {
        const date = new Date(post.createdAt);
        const dateStr = date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        
        const showDate = index === 0 || 
          new Date(posts[index-1].createdAt).toDateString() !== date.toDateString();

        return (
          <div key={post.id} className="relative animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Date Badge */}
            {showDate && (
              <div className="absolute -left-8 md:-left-16 top-[-48px] mb-8 z-20">
                <div className="bg-brand-950 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ring-4 ring-white inline-block">
                  {dateStr}
                </div>
              </div>
            )}

            {/* Timeline Indicator Dot */}
            <div className="absolute -left-[28px] md:-left-[44px] top-8 w-7 h-7 bg-white rounded-full border-4 border-brand-500 shadow-xl z-10 transition-transform hover:scale-125" />

            {/* Post Card - Premium Glassmorphism style */}
            <div className="card group bg-white/80 backdrop-blur-xl border border-white ring-1 ring-brand-50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-visible" style={{ borderRadius: '3rem' }}>
              <div className="p-8 md:p-10">
                
                {/* Header: Author & Blog Link */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-brand-100 shadow-inner ring-4 ring-white group-hover:rotate-3 transition-transform">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-2xl text-brand-600">
                          {post.author.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-brand-950 tracking-tight">{post.author.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{timeStr}</span>
                        {post.trip && (
                          <Link href={`/dashboard/trips/${post.trip.id}`} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-950 hover:text-white transition-all">
                             🚢 {post.trip.title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visit Blog Button - only for others or if blog exists */}
                  <button className="hidden md:flex btn bg-brand-50 text-brand-900 border-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-950 hover:text-white transition-all shadow-sm">
                    Blog Přátel →
                  </button>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                  {post.locationName && (
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 shadow-inner group-hover:scale-105 transition-transform">
                      <span className="text-2xl">📍</span>
                      <span className="text-sm font-bold text-brand-900">{post.locationName}</span>
                    </div>
                  )}

                  {post.content && (
                    <div className="text-lg leading-relaxed text-brand-950 font-medium whitespace-pre-wrap opacity-90">
                      {post.content}
                    </div>
                  )}

                  {/* Media Grid */}
                  {post.mediaUrls?.length > 0 && (
                    <div className={`grid gap-4 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.mediaUrls.map((url, i) => (
                        <div key={i} className="rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/20 aspect-video group/img">
                          <img 
                            src={url} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                            alt="Moment" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interaction Footer */}
                <div className="mt-10 pt-8 border-t border-brand-50 flex items-center justify-between">
                  <div className="flex gap-10">
                    <button className="flex items-center gap-3 group/btn">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover/btn:bg-red-50 transition-all">
                        <span className="text-2xl group-hover/btn:scale-125 transition-transform grayscale hover:grayscale-0">❤️</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-brand-950">24</span>
                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Líbí se</span>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 group/btn">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover/btn:bg-blue-50 transition-all">
                        <span className="text-2xl group-hover/btn:scale-125 transition-transform grayscale hover:grayscale-0">💬</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-brand-950">5</span>
                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Komentářů</span>
                      </div>
                    </button>
                  </div>
                  <button className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-brand-50 transition-colors text-2xl grayscale hover:grayscale-0" title="Uložit si">
                    🔖
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
