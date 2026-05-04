"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface PostComposerProps {
  tripId?: string;
  onSuccess?: () => void;
}

export default function PostComposer({ tripId, onSuccess }: PostComposerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"BLOG" | "CHECKIN">("BLOG");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [activeTrips, setActiveTrips] = useState<{id: string, title: string}[]>([]);

  // Načtení aktivních výletů pro výběr
  useEffect(() => {
    if (!tripId) {
      fetch("/api/trips?status=ONGOING")
        .then(res => res.json())
        .then(data => setActiveTrips(data.trips || []))
        .catch(() => {});
    }
  }, [tripId]);

  // Funkce pro získání aktuální polohy
  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString()
        });
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) setLocationName(data.display_name);
          });
      });
    }
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: LocationResult) => {
    setLocationName(loc.display_name);
    setCoords({ lat: loc.lat, lng: loc.lon });
    setSearchResults([]);
    setMode("CHECKIN");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !locationName) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/social/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          locationName,
          lat: coords ? parseFloat(coords.lat) : null,
          lng: coords ? parseFloat(coords.lng) : null,
          tripId: selectedTripId || null,
          type: mode,
          mediaUrls: []
        }),
      });

      if (res.ok) {
        setContent("");
        setLocationName("");
        setCoords(null);
        setMode("BLOG");
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex gap-4 mb-6">
        <button 
          type="button" 
          onClick={() => setMode("BLOG")}
          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === "BLOG" ? "bg-brand-950 text-white shadow-xl scale-105" : "bg-brand-50 text-brand-400 hover:bg-brand-100"}`}
        >
          ✍️ Příspěvek
        </button>
        <button 
          type="button" 
          onClick={() => setMode("CHECKIN")}
          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === "CHECKIN" ? "bg-brand-950 text-white shadow-xl scale-105" : "bg-brand-50 text-brand-400 hover:bg-brand-100"}`}
        >
          📍 Check-in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <textarea
            className="w-full text-lg border-none focus:ring-0 resize-none min-h-[120px] bg-white/50 p-6 rounded-[2rem] placeholder:text-slate-300 font-medium shadow-inner transition-all focus:bg-white"
            placeholder={mode === "BLOG" ? "Co máš dnes na srdci? 📝" : "Kde jsi a jak se tam cítíš? 🗺️"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="pt-2 flex flex-col gap-4">
          {(mode === "CHECKIN" || locationName) && (
            <div className="relative animate-slide-up">
              <div className="flex items-center gap-3 px-6 py-4 bg-brand-50 rounded-2xl border border-brand-100 focus-within:border-brand-400 focus-within:bg-white transition-all shadow-inner">
                <span className="text-xl">📍</span>
                <input
                  type="text"
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-brand-950"
                  placeholder="Vyhledej místo..."
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    searchAddress(e.target.value);
                  }}
                />
                <button 
                  type="button" 
                  onClick={getGeoLocation}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-200 rounded-xl text-brand-700 transition-colors bg-white shadow-sm border border-brand-100"
                  title="Moje aktuální poloha"
                >
                  🎯
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-30 w-full mt-2 bg-white shadow-2xl rounded-[2rem] border border-brand-50 overflow-hidden animate-slide-up ring-1 ring-brand-100">
                  {searchResults.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-6 py-4 text-sm font-bold text-brand-950 hover:bg-brand-50 border-b border-brand-50 last:border-none transition-colors flex items-center gap-3"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-lg text-lg">🚩</span>
                      <span className="truncate">{loc.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between bg-white/30 p-2 rounded-2xl border border-white/50">
            <div className="flex gap-1 items-center">
              {!tripId && activeTrips.length > 0 && (
                <select 
                  className="bg-white border border-brand-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-600 outline-none hover:border-brand-300 transition-colors cursor-pointer"
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                >
                  <option value="">🏠 Veřejná zeď</option>
                  {activeTrips.map(t => (
                    <option key={t.id} value={t.id}>🚢 {t.title}</option>
                  ))}
                </select>
              )}
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition-all text-xl grayscale hover:grayscale-0" title="Přidat fotky">📸</button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!content && !locationName)}
              className="btn btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-brand-200 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              {isSubmitting ? "Odesílám..." : "Publikovat 🚀"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
