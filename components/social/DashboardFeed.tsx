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

import { PostDetail } from "@/components/trips/PostDetail";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  const handleUpdatePost = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/social/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
        if (selectedPost?.id === id) setSelectedPost({ ...selectedPost, ...updated });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/social/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        setSelectedPost(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-white/50 rounded-[2.5rem] border border-brand-100/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <PostComposer onSuccess={fetchPosts} />

      <div className="relative pl-10 md:pl-14 space-y-12 pb-24">
        <div className="absolute left-[19px] md:left-[27px] top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-brand-100/50 via-brand-200/40 to-transparent" />

        {posts.map((post) => (
          <article 
            key={post.id} 
            className="relative animate-fade-in group cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            <div className="absolute -left-[35px] md:-left-[43px] top-0 w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-white border border-brand-100 shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 group-hover:shadow-md">
              <div className={`p-2 rounded-xl ${
                post.type === "PHOTO" ? "bg-purple-50 text-purple-600" :
                post.type === "CHECKIN" ? "bg-blue-50 text-blue-600" :
                post.type === "EXPENSE" ? "bg-emerald-50 text-emerald-600" :
                post.type === "MILEAGE" ? "bg-orange-50 text-orange-600" :
                "bg-brand-50 text-brand-600"
              }`}>
                {post.type === "PHOTO" && <Icons.PHOTO className="w-4 h-4 md:w-5 md:h-5" />}
                {post.type === "CHECKIN" && <Icons.CHECKIN className="w-4 h-4 md:w-5 md:h-5" />}
                {post.type === "EXPENSE" && <Icons.EXPENSE className="w-4 h-4 md:w-5 md:h-5" />}
                {post.type === "MILEAGE" && <Icons.MILEAGE className="w-4 h-4 md:w-5 md:h-5" />}
                {post.type === "BLOG" && <Icons.BLOG className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
            </div>

            <div className="bg-white border border-brand-100 rounded-[2.5rem] shadow-sm overflow-hidden transition-all group-hover:shadow-md group-hover:border-brand-200/50">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100/50 flex items-center justify-center text-[10px] font-black text-brand-600 overflow-hidden shadow-sm">
                    {post.author.avatar ? (
                      <Image src={post.author.avatar} alt={post.author.name} width={36} height={36} className="object-cover w-full h-full" />
                    ) : post.author.name[0]}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-brand-950 uppercase tracking-tight">{post.author.name}</div>
                    <div className="text-[9px] text-brand-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(post.loggedAt).toLocaleString('cs-CZ', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                {post.trip && (
                  <div className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-brand-100/20">
                    {post.trip.title}
                  </div>
                )}
              </div>

              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="relative aspect-[4/3] w-full bg-brand-50 overflow-hidden border-y border-brand-50">
                  <Image 
                    src={post.mediaUrls[0]} 
                    alt="Obsah" 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  {post.mediaUrls.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                      +{post.mediaUrls.length - 1} fotek
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 md:p-8 space-y-6">
                {(post.amount || post.mileage || post.locationName) && (
                  <div className="flex flex-wrap gap-2.5">
                    {post.locationName && (
                      <div className="flex items-center gap-2 bg-blue-50/40 text-blue-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100/30">
                        <Icons.CHECKIN className="w-3.5 h-3.5" /> {post.locationName.split(',')[0]}
                      </div>
                    )}
                    {post.amount && (
                      <div className="flex items-center gap-2 bg-emerald-50/40 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/30">
                        <Icons.EXPENSE className="w-3.5 h-3.5" /> {post.amount.toLocaleString()} CZK
                      </div>
                    )}
                    {post.mileage && (
                      <div className="flex items-center gap-2 bg-orange-50/40 text-orange-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100/30">
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

              <div className="px-6 py-4 bg-brand-50/20 border-t border-brand-50/50 flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-300">
                  <svg viewBox="0 0 24 24" fill={post.likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  {post._count.likes}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {post._count.comments}
                </div>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-brand-100">
            <div className="text-4xl mb-6 grayscale opacity-30">🌵</div>
            <h3 className="text-lg font-black text-brand-950 uppercase tracking-widest">Pusto a prázdno</h3>
            <p className="text-xs text-brand-400 mt-2 font-bold uppercase tracking-widest">Začni svůj příběh nahoře!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 bg-brand-950/20 backdrop-blur-sm z-[999]"
            />
            <PostDetail 
              post={selectedPost} 
              onClose={() => setSelectedPost(null)}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
