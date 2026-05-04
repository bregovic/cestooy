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
    <div className="space-y-6 pb-20">
      {posts.map((post, index) => {
        const date = new Date(post.createdAt);
        const timeStr = date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
        
        const showDateLabel = index === 0 || 
          new Date(posts[index-1].createdAt).toDateString() !== date.toDateString();

        return (
          <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            {showDateLabel && (
              <div className="px-2 mb-4 mt-8 first:mt-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-300">{dateStr}</span>
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-brand-100/50 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="p-6 md:p-8">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-50 shadow-inner">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-brand-400 text-sm">
                          {post.author.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-brand-950">{post.author.name}</div>
                      <div className="text-[9px] text-brand-300 font-bold uppercase tracking-widest">{timeStr}</div>
                    </div>
                  </div>
                  {post.trip && (
                    <Link href={`/dashboard/trips/${post.trip.id}`} className="text-[9px] font-black uppercase tracking-widest text-brand-400 hover:text-brand-950 transition-colors">
                      🚢 {post.trip.title}
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  {post.locationName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-lg text-[10px] font-bold text-brand-600">
                      📍 {post.locationName}
                    </div>
                  )}

                  {post.content && (
                    <div className="text-sm leading-relaxed text-brand-900/80 font-medium whitespace-pre-wrap">
                      {post.content}
                    </div>
                  )}

                  {post.mediaUrls?.length > 0 && (
                    <div className={`grid gap-2 rounded-2xl overflow-hidden ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.mediaUrls.map((url, i) => (
                        <img key={i} src={url} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" alt="Moment" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-brand-50/50 flex gap-6">
                  <button className="flex items-center gap-2 text-brand-300 hover:text-brand-950 transition-colors group/btn">
                    <span className="text-lg grayscale group-hover/btn:grayscale-0 transition-all">❤️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Líbí se</span>
                  </button>
                  <button className="flex items-center gap-2 text-brand-300 hover:text-brand-950 transition-colors group/btn">
                    <span className="text-lg grayscale group-hover/btn:grayscale-0 transition-all">💬</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Komentovat</span>
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
