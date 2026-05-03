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
        setPosts(data);
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
      <div className="card py-20 text-center" style={{ borderRadius: '2.5rem' }}>
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold">Tvá zeď je zatím prázdná</h3>
        <p className="text-secondary mt-2">Sleduj své přátele nebo přidej svůj první zážitek!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {posts.map((post) => (
        <div key={post.id} className="card shadow-xl overflow-hidden group border-none hover:shadow-2xl transition-shadow duration-500" style={{ borderRadius: '2.5rem' }}>
          <div className="p-6 md:p-8 flex flex-col gap-6">
            
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center shadow-inner ring-4 ring-brand-50">
                  {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full object-cover" /> : <span className="font-bold">{post.author.name[0]}</span>}
                </div>
                <div>
                  <div className="font-bold text-lg leading-tight">{post.author.name}</div>
                  <div className="text-[10px] text-secondary flex items-center gap-1 uppercase tracking-wider font-bold mt-1">
                    <span>{new Date(post.createdAt).toLocaleDateString('cs-CZ')}</span>
                    {post.trip && (
                      <>
                        <span className="mx-1 opacity-30">•</span>
                        <Link href={`/dashboard/trips/${post.trip.id}`} className="text-brand-600 hover:underline">
                          🚢 {post.trip.title}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon opacity-40 hover:opacity-100 transition-opacity">•••</button>
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                {post.content}
              </div>
            )}

            {/* Post Media */}
            {post.mediaUrls?.length > 0 && (
              <div className="rounded-[2rem] overflow-hidden shadow-inner bg-muted/20">
                <div className={`grid gap-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.mediaUrls.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      className="w-full h-auto object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-700 cursor-zoom-in" 
                      alt="Zážitek" 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Location Badge */}
            {post.locationName && (
              <div className="flex">
                <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border border-brand-100 shadow-sm">
                  📍 {post.locationName}
                </div>
              </div>
            )}

            {/* Post Footer / Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-muted/20 mt-2">
              <div className="flex gap-8">
                <button className="flex items-center gap-2 group/like">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/like:bg-red-50 transition-colors">
                    <span className="text-xl group-hover/like:scale-125 transition-transform">🤍</span>
                  </div>
                  <span className="font-bold text-secondary text-sm">To se mi líbí</span>
                </button>
                <button className="flex items-center gap-2 group/comment">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/comment:bg-blue-50 transition-colors">
                    <span className="text-xl group-hover/comment:scale-125 transition-transform">💬</span>
                  </div>
                  <span className="font-bold text-secondary text-sm">Komentovat</span>
                </button>
              </div>
              <button className="flex items-center gap-2 text-brand-500 font-bold hover:underline px-4 py-2 hover:bg-brand-50 rounded-xl transition-colors">
                🔖 Uložit
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
