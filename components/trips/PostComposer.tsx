"use client";

import { useState, useEffect } from "react";
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
      <div className="flex gap-2 mb-6 p-1 bg-brand-50 rounded-2xl">
        <button 
          type="button" 
          onClick={() => { setMode("BLOG"); setLocationName(""); }}
          className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${mode === "BLOG" ? "bg-white text-brand-950 shadow-sm" : "text-brand-400 hover:text-brand-600"}`}
        >
          Příspěvek
        </button>
        <button 
          type="button" 
          onClick={() => setMode("CHECKIN")}
          className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${mode === "CHECKIN" ? "bg-white text-brand-950 shadow-sm" : "text-brand-400 hover:text-brand-600"}`}
        >
          Check-in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            className="w-full text-base border-none focus:ring-0 resize-none min-h-[100px] bg-transparent p-2 placeholder:text-brand-200 font-medium transition-all"
            placeholder={mode === "BLOG" ? "Co nového?" : "Kde se právě nacházíš?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="pt-2 flex flex-col gap-4">
          {(mode === "CHECKIN" || locationName) && (
            <div className="relative animate-slide-up">
              <div className="flex items-center gap-3 px-5 py-3 bg-brand-50/50 rounded-2xl border border-transparent focus-within:border-brand-100 focus-within:bg-white transition-all">
                <span className="text-lg opacity-50">📍</span>
                <input
                  type="text"
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-brand-950 placeholder:text-brand-200"
                  placeholder="Hledat místo..."
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    searchAddress(e.target.value);
                  }}
                />
                <button 
                  type="button" 
                  onClick={getGeoLocation}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg text-brand-700 transition-all opacity-50 hover:opacity-100"
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
                      className="w-full text-left px-6 py-4 text-xs font-bold text-brand-950 hover:bg-brand-50 border-b border-brand-50 last:border-none transition-colors"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-brand-50">
            <div className="flex gap-4 items-center">
              {!tripId && activeTrips.length > 0 && (
                <div className="relative">
                  <select 
                    className="appearance-none bg-brand-50 border-none rounded-xl pl-4 pr-10 py-2.5 text-[9px] font-black uppercase tracking-widest text-brand-600 outline-none hover:bg-brand-100 transition-colors cursor-pointer"
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                  >
                    <option value="">Veřejná zeď</option>
                    {activeTrips.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] opacity-30">▼</div>
                </div>
              )}
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-50 transition-all text-xl opacity-40 hover:opacity-100">🖼️</button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!content && !locationName)}
              className="bg-brand-950 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-100 font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale"
            >
              {isSubmitting ? "..." : "Publikovat"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
