"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PostComposer from "@/components/trips/PostComposer";

interface Post {
  id: string;
  content: string | null;
  type: string;
  mediaUrls: string[];
  locationName: string | null;
  amount: number | null;
  mileage: number | null;
  loggedAt: string;
  author: {
    name: string;
    avatar: string | null;
  };
  trip?: {
    id: string;
    title: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likedByMe: boolean;
}

export default function DashboardFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/social/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-white/50 rounded-[2rem] border border-brand-100/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PostComposer onSuccess={fetchPosts} />

      <div className="relative pl-8 md:pl-12 space-y-12 pb-20">
        {/* The Timeline Line */}
        <div className="absolute left-[15px] md:left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-100 via-brand-200/50 to-transparent" />

        {posts.map((post) => (
          <article key={post.id} className="relative animate-fade-in group">
            
            {/* Timeline Dot/Icon */}
            <div className="absolute -left-[31px] md:-left-[39px] top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-[var(--bg-color)] shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110">
              {post.type === "PHOTO" && <span className="text-xs">📸</span>}
              {post.type === "CHECKIN" && <span className="text-xs">📍</span>}
              {post.type === "EXPENSE" && <span className="text-xs">💰</span>}
              {post.type === "MILEAGE" && <span className="text-xs">⛽</span>}
              {post.type === "BLOG" && <span className="text-xs">✍️</span>}
            </div>

            <div className="glass-panel overflow-hidden">
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-brand-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-600 overflow-hidden border border-brand-100/50">
                    {post.author.avatar ? (
                      <Image src={post.author.avatar} alt={post.author.name} width={32} height={32} />
                    ) : post.author.name[0]}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-brand-950">{post.author.name}</div>
                    <div className="text-[9px] text-brand-400 font-medium">
                      {new Date(post.loggedAt).toLocaleString('cs-CZ', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                {post.trip && (
                  <Link href={`/dashboard/trips/${post.trip.id}`} className="text-[9px] font-bold bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
                    📂 {post.trip.title}
                  </Link>
                )}
              </div>

              {/* Media Content */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="relative aspect-video w-full bg-brand-50 overflow-hidden">
                  <Image 
                    src={post.mediaUrls[0]} 
                    alt="Obsah" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
              )}

              {/* Data Badge Area */}
              {(post.amount || post.mileage || post.locationName) && (
                <div className="px-5 pt-5 flex flex-wrap gap-3">
                  {post.locationName && (
                    <div className="flex items-center gap-2 bg-blue-50/50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-blue-100/30">
                      <span>📍</span> {post.locationName.split(',')[0]}
                    </div>
                  )}
                  {post.amount && (
                    <div className="flex items-center gap-2 bg-emerald-50/50 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-emerald-100/30">
                      <span>💰</span> {post.amount.toLocaleString()} CZK
                    </div>
                  )}
                  {post.mileage && (
                    <div className="flex items-center gap-2 bg-orange-50/50 text-orange-700 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-orange-100/30">
                      <span>⛽</span> {post.mileage.toLocaleString()} km
                    </div>
                  )}
                </div>
              )}

              {/* Text Content */}
              {post.content && (
                <div className="p-6 text-sm text-brand-950 leading-relaxed font-medium">
                  {post.content}
                </div>
              )}

              {/* Actions Footer */}
              <div className="px-5 py-4 border-t border-brand-50/50 flex items-center gap-6">
                <button className={`flex items-center gap-2 text-[10px] font-bold transition-colors ${post.likedByMe ? "text-red-500" : "text-brand-300 hover:text-red-500"}`}>
                  {post.likedByMe ? "❤️" : "🤍"} {post._count.likes}
                </button>
                <button className="flex items-center gap-2 text-[10px] font-bold text-brand-300 hover:text-brand-950 transition-colors">
                  💬 {post._count.comments}
                </button>
                <button className="ml-auto text-brand-300 hover:text-brand-950 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🌵</div>
            <h3 className="text-lg font-bold text-brand-950">Zatím tu nic není</h3>
            <p className="text-sm text-brand-400 mt-1">Začni svůj první expediční log nahoře!</p>
          </div>
        )}
      </div>
    </div>
  );
}
