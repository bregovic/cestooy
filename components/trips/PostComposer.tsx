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
  const [mode, setMode] = useState<"TEXT" | "PHOTO" | "PLACE">("TEXT");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [activeTrips, setActiveTrips] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    if (!tripId) {
      fetch("/api/trips?status=ONGOING")
        .then(res => res.json())
        .then(data => setActiveTrips(data.trips || []))
        .catch(() => {});
    }
  }, [tripId]);

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toString();
        const lon = pos.coords.longitude.toString();
        setCoords({ lat, lng: lon });
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              setAddress(data.display_name);
              // Try to get a simpler name from the data if possible
              const name = data.address.amenity || data.address.building || data.address.road || "Moje poloha";
              setLocationName(name);
            }
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
    setLocationName(loc.display_name.split(",")[0]);
    setAddress(loc.display_name);
    setCoords({ lat: loc.lat, lng: loc.lon });
    setSearchResults([]);
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
          locationName: mode === "PLACE" ? locationName : null,
          address: mode === "PLACE" ? address : null,
          lat: coords ? parseFloat(coords.lat) : null,
          lng: coords ? parseFloat(coords.lng) : null,
          tripId: selectedTripId || null,
          type: mode === "PLACE" ? "CHECKIN" : "BLOG",
          mediaUrls: []
        }),
      });

      if (res.ok) {
        setContent("");
        setLocationName("");
        setAddress("");
        setCoords(null);
        setMode("TEXT");
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
    <div className="animate-fade-in space-y-6">
      {/* Tabs Switcher - Clean & Professional */}
      <div className="flex p-1.5 bg-brand-50/50 rounded-2xl border border-brand-100/20 max-w-sm">
        {(["TEXT", "PHOTO", "PLACE"] as const).map((m) => (
          <button 
            key={m}
            type="button" 
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${mode === m ? "bg-white text-brand-950 shadow-md" : "text-brand-400 hover:text-brand-600"}`}
          >
            {m === "TEXT" ? "Text" : m === "PHOTO" ? "Foto" : "Místo"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "PLACE" && (
          <div className="space-y-4 animate-slide-up">
            <div className="relative">
              <div className="flex items-center gap-3 px-5 py-4 bg-brand-50/50 rounded-2xl border border-transparent focus-within:border-brand-100 focus-within:bg-white transition-all">
                <span className="text-lg opacity-40">🏢</span>
                <input
                  type="text"
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-brand-950 placeholder:text-brand-200"
                  placeholder="Název místa (např. Moje oblíbená kavárna)"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    searchAddress(e.target.value);
                  }}
                />
                <button 
                  type="button" 
                  onClick={getGeoLocation}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-100 rounded-xl text-brand-700 transition-all bg-white shadow-sm border border-brand-50"
                  title="Najít mou polohu"
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
                      className="w-full text-left px-6 py-4 text-[11px] font-bold text-brand-950 hover:bg-brand-50 border-b border-brand-50 last:border-none transition-colors"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 bg-brand-50/30 rounded-2xl border border-transparent focus-within:border-brand-100 focus-within:bg-white transition-all">
              <span className="text-xs opacity-40">📍</span>
              <input
                type="text"
                className="bg-transparent border-none focus:ring-0 w-full text-[11px] font-medium text-brand-600 placeholder:text-brand-200"
                placeholder="Přesná adresa (ulice, město...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            className="w-full text-base border-none focus:ring-0 resize-none min-h-[100px] bg-transparent p-2 placeholder:text-brand-200 font-medium transition-all"
            placeholder={mode === "TEXT" ? "Co nového?" : mode === "PHOTO" ? "Napiš něco k fotce..." : "Jak se ti tu líbí?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-brand-50">
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
            {mode === "PHOTO" && (
              <button type="button" className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-100 transition-all">
                <span>📸</span> Vybrat foto
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (!content && !locationName)}
            className="bg-brand-950 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-100 font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale"
          >
            {isSubmitting ? "..." : "Publikovat"}
          </button>
        </div>
      </form>
    </div>
  );
}
