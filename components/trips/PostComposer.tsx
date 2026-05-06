"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostComposerProps {
  tripId?: string;
  onSuccess?: () => void;
}

type Mode = "TEXT" | "PHOTO" | "PLACE" | "EXPENSE" | "MILEAGE";

const Icons = {
  TEXT: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  ),
  PHOTO: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
  PLACE: (props: any) => (
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

export default function PostComposer({ tripId, onSuccess }: PostComposerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("TEXT");
  const [loading, setLoading] = useState(false);
  
  // Fields
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [mileage, setMileage] = useState("");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().slice(0, 16));
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function searchLocation() {
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newUrls = [...mediaUrls];

    for (const file of files) {
      try {
        let finalUrl = "";
        if (file.type.startsWith("image/")) {
          finalUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new (window as any).Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                  if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                  if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.7));
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
        } else {
          if (file.size > 20 * 1024 * 1024) {
            alert("Video je příliš velké (max 20MB).");
            continue;
          }
          finalUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }
        newUrls.push(finalUrl);
      } catch (err) {
        console.error(err);
      }
    }

    setMediaUrls(newUrls);
    setIsUploading(false);
    if (e.target) e.target.value = "";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const typeMap: Record<Mode, string> = {
      TEXT: "BLOG", PHOTO: "PHOTO", PLACE: "CHECKIN", EXPENSE: "EXPENSE", MILEAGE: "MILEAGE"
    };

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId, content, type: typeMap[mode], mediaUrls,
          locationName: placeName || query, lat: lat ? parseFloat(lat) : null,
          lng: lon ? parseFloat(lon) : null, amount: amount ? parseFloat(amount) : null,
          mileage: mileage ? parseInt(mileage) : null, loggedAt: new Date(loggedAt).toISOString(),
        }),
      });

      if (res.ok) {
        setContent(""); setMediaUrls([]); setPlaceName(""); setAmount(""); setMileage(""); setQuery(""); setResults([]);
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-brand-100 rounded-[2.5rem] p-4 md:p-6 mb-10 shadow-sm">
      {/* Premium Tab Switcher */}
      <div className="flex items-center justify-between gap-1 mb-6 bg-brand-50/50 p-1.5 rounded-3xl border border-brand-100/30">
        {(["TEXT", "PHOTO", "PLACE", "EXPENSE", "MILEAGE"] as Mode[]).map((m) => (
          <button 
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${mode === m ? "bg-white text-brand-950 shadow-sm border border-brand-100/20" : "text-brand-300 hover:text-brand-500"}`}
          >
            <div className={`p-1.5 rounded-lg ${mode === m ? "bg-brand-50 text-brand-600" : "bg-transparent text-current"}`}>
              {m === "TEXT" && <Icons.TEXT className="w-4 h-4" />}
              {m === "PHOTO" && <Icons.PHOTO className="w-4 h-4" />}
              {m === "PLACE" && <Icons.PLACE className="w-4 h-4" />}
              {m === "EXPENSE" && <Icons.EXPENSE className="w-4 h-4" />}
              {m === "MILEAGE" && <Icons.MILEAGE className="w-4 h-4" />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{m === "TEXT" ? "Story" : m === "PHOTO" ? "Foto" : m === "PLACE" ? "Místo" : m === "EXPENSE" ? "Výdaj" : "KM"}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-2 bg-brand-50/30 rounded-xl border border-brand-100/10">
             <span className="text-[9px] font-black text-brand-300 uppercase tracking-widest">Kdy</span>
             <input type="datetime-local" className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-brand-950 outline-none p-0" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} />
           </div>

           {mode === "EXPENSE" && (
             <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/30">
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Částka</span>
               <input type="number" className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-emerald-950 outline-none p-0 w-16" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
               <span className="text-[9px] font-black text-emerald-400">CZK</span>
             </div>
           )}

           {mode === "MILEAGE" && (
             <div className="flex items-center gap-2 px-3 py-2 bg-orange-50/50 rounded-xl border border-orange-100/30">
               <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">KM</span>
               <input type="number" className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-orange-950 outline-none p-0 w-24" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Stav" />
             </div>
           )}

           <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-100/50 cursor-pointer hover:bg-brand-50 transition-all ${isUploading ? 'opacity-50 grayscale' : ''}`}>
             <Icons.PHOTO className="w-3.5 h-3.5 text-brand-400" />
             <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">{isUploading ? 'Nahrávám...' : 'Přidat média'}</span>
             <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
           </label>
        </div>

        {/* Media Preview Gallery */}
        {mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2">
            {mediaUrls.map((url, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-100">
                {url.startsWith("data:video") ? (
                  <div className="w-full h-full bg-brand-950 flex items-center justify-center text-[8px] font-bold text-white">VIDEO</div>
                ) : (
                  <img src={url} className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm">
                  <span className="text-[10px] font-bold">×</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {mode === "PLACE" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" placeholder="Kde jsi?" className="flex-1 bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-xs focus:bg-white outline-none font-medium" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button type="button" onClick={searchLocation} className="px-4 bg-brand-950 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90">Hledat</button>
            </div>
            {results.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-white border border-brand-100 rounded-xl shadow-lg divide-y divide-brand-50">
                {results.map((r, i) => (
                  <button key={i} type="button" onClick={() => { setPlaceName(r.display_name); setLat(r.lat); setLon(r.lon); setResults([]); }} className="w-full text-left px-4 py-2.5 text-[10px] hover:bg-brand-50 transition-colors font-bold">
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
            {placeName && <div className="text-[10px] font-black text-brand-600 flex items-center gap-2 px-1">📍 {placeName.split(',')[0]}</div>}
          </div>
        )}

        <textarea
          placeholder={mode === "TEXT" ? "Co máš dnes na srdci?" : "Přidej k tomu pár slov..."}
          className="w-full bg-brand-50/20 border-none rounded-2xl p-4 min-h-[100px] text-sm focus:bg-brand-50/40 transition-all outline-none resize-none font-medium placeholder:text-brand-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || isUploading || (!content.trim() && !amount && !mileage && mediaUrls.length === 0 && !placeName)}
            className="bg-brand-950 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-950/10 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-20 flex items-center gap-2"
          >
            {loading ? "Ukládám..." : "Uložit záznam"}
          </button>
        </div>
      </form>
    </div>
  );
}
