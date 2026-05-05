"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostComposerProps {
  tripId?: string;
  onSuccess?: () => void;
}

type Mode = "TEXT" | "PHOTO" | "PLACE" | "EXPENSE" | "MILEAGE";

export default function PostComposer({ tripId, onSuccess }: PostComposerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("TEXT");
  const [loading, setLoading] = useState(false);
  
  // Fields
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [mileage, setMileage] = useState("");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().slice(0, 16));
  
  // Search for location
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const typeMap: Record<Mode, string> = {
      TEXT: "BLOG",
      PHOTO: "PHOTO",
      PLACE: "CHECKIN",
      EXPENSE: "EXPENSE",
      MILEAGE: "MILEAGE"
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          content,
          type: typeMap[mode],
          mediaUrls: image ? [image] : [],
          locationName: placeName || query,
          lat: lat ? parseFloat(lat) : null,
          lng: lon ? parseFloat(lon) : null,
          amount: amount ? parseFloat(amount) : null,
          mileage: mileage ? parseInt(mileage) : null,
          loggedAt: new Date(loggedAt).toISOString(),
        }),
      });

      if (res.ok) {
        setContent("");
        setImage("");
        setPlaceName("");
        setAmount("");
        setMileage("");
        setQuery("");
        setResults([]);
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
    <div className="glass-panel p-6 mb-8 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-brand-50/50 rounded-2xl border border-brand-100/20">
        {(["TEXT", "PHOTO", "PLACE", "EXPENSE", "MILEAGE"] as Mode[]).map((m) => (
          <button 
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mode === m ? "bg-white text-brand-950 shadow-md" : "text-brand-300 hover:text-brand-500"}`}
          >
            {m === "TEXT" && "✍️ Text"}
            {m === "PHOTO" && "📸 Foto"}
            {m === "PLACE" && "📍 Místo"}
            {m === "EXPENSE" && "💰 Výdaj"}
            {m === "MILEAGE" && "⛽ KM"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Universal Time Picker for all modes */}
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-50/30 rounded-xl border border-brand-100/10">
          <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider">Kdy:</span>
          <input 
            type="datetime-local" 
            className="bg-transparent border-none focus:ring-0 text-xs font-bold text-brand-950 outline-none"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
          />
        </div>

        {mode === "PLACE" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hledat lokaci (např. Berlin, Hotel...)"
                className="flex-1 bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-sm focus:bg-white outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="button" onClick={searchLocation} className="px-4 bg-brand-100 text-brand-600 rounded-2xl font-bold text-xs hover:bg-brand-200">Hledat</button>
            </div>
            {results.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-white border border-brand-100 rounded-xl shadow-lg">
                {results.map((r, i) => (
                  <button key={i} type="button" onClick={() => { setPlaceName(r.display_name); setLat(r.lat); setLon(r.lon); setResults([]); }} className="w-full text-left px-4 py-2 text-xs hover:bg-brand-50 border-b border-brand-50">
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
            {placeName && <div className="text-xs font-bold text-brand-600 flex items-center gap-2">✅ {placeName.split(',')[0]}</div>}
          </div>
        )}

        {mode === "EXPENSE" && (
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Částka"
              className="w-32 bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-sm focus:bg-white outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select className="bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-sm outline-none">
              <option>CZK</option>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </div>
        )}

        {mode === "MILEAGE" && (
          <input
            type="number"
            placeholder="Stav kilometrů (např. 125800)"
            className="w-full bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-sm focus:bg-white outline-none"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
        )}

        {mode === "PHOTO" && (
          <input
            type="text"
            placeholder="URL fotky (připravujeme nahrávání...)"
            className="w-full bg-brand-50/50 border border-brand-100/50 rounded-2xl py-3 px-4 text-sm focus:bg-white outline-none"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        )}

        <textarea
          placeholder={mode === "TEXT" ? "Napiš střípek z cesty..." : "Přidej popis k záznamu..."}
          className="w-full bg-brand-50/50 border border-brand-100/50 rounded-3xl p-5 min-h-[120px] text-sm focus:bg-white transition-all outline-none resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || (!content.trim() && !amount && !mileage && !image && !placeName)}
            className="bg-brand-950 text-white px-10 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-950/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {loading ? "Ukládám..." : "Uložit záznam →"}
          </button>
        </div>
      </form>
    </div>
  );
}
