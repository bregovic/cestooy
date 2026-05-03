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
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funkce pro získání aktuální polohy
  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString()
        });
      });
    }
  };

  // Hledání adresy přes OpenStreetMap
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
      console.error("Chyba při hledání adresy", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: LocationResult) => {
    setLocationName(loc.display_name);
    setCoords({ lat: loc.lat, lng: loc.lon });
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !locationName) return;

    setIsSubmitting(true);
    try {
      // Používáme jednotné API pro sociální posty
      const res = await fetch(`/api/social/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          locationName,
          lat: coords?.lat,
          lng: coords?.lng,
          tripId: tripId, // Může být undefined pro obecné posty
          type: locationName ? "CHECKIN" : "BLOG",
          mediaUrls: []
        }),
      });

      if (res.ok) {
        setContent("");
        setLocationName("");
        setCoords(null);
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (err) {
      console.error("Chyba při ukládání", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full text-lg border-none focus:ring-0 resize-none min-h-[100px] bg-transparent placeholder:text-slate-400 font-medium"
          placeholder="Poděl se o kousek svého příběhu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
          {/* Location Input */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-brand-200 focus-within:bg-white transition-all shadow-inner">
              <span className="text-xl grayscale group-focus-within:grayscale-0 transition-all">📍</span>
              <input
                type="text"
                className="bg-transparent border-none focus:ring-0 w-full text-sm font-semibold"
                placeholder="Kde se nacházíš?"
                value={locationName}
                onChange={(e) => {
                  setLocationName(e.target.value);
                  searchAddress(e.target.value);
                }}
              />
              <button 
                type="button" 
                onClick={getGeoLocation}
                className="w-8 h-8 flex items-center justify-center hover:bg-brand-100 rounded-full text-brand-600 transition-colors"
                title="Moje poloha"
              >
                🎯
              </button>
            </div>

            {/* Address results */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden animate-slide-up">
                {searchResults.map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-4 py-4 text-sm font-medium hover:bg-brand-50 border-b border-slate-50 last:border-none transition-colors flex items-center gap-2"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <span className="opacity-50">🚩</span>
                    <span className="truncate">{loc.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-50 text-xl grayscale hover:grayscale-0 transition-all" title="Přidat fotku">📸</button>
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-50 text-xl grayscale hover:grayscale-0 transition-all" title="Moje nálada">😊</button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!content && !locationName)}
              className="btn btn-primary px-10 py-3 rounded-2xl shadow-lg shadow-brand-100 font-bold tracking-wide"
            >
              {isSubmitting ? "Odesílám..." : "Publikovat"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
