"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function PostComposer({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funkce pro získání aktuální polohy (pouze jako pomocník)
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

  // Hledání adresy přes OpenStreetMap (Nominatim)
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
      const res = await fetch(`/api/trips/${tripId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          locationName,
          lat: coords?.lat,
          lng: coords?.lng,
          type: locationName ? "CHECKIN" : "BLOG",
          mediaUrls: [] // Tady se později přidají fotky
        }),
      });

      if (res.ok) {
        setContent("");
        setLocationName("");
        setCoords(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Chyba při ukládání", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-xl overflow-hidden animate-fade-in" style={{ borderRadius: 'var(--radius-2xl)' }}>
      <form onSubmit={handleSubmit} className="p-6">
        <textarea
          className="w-full text-lg border-none focus:ring-0 resize-none min-h-[120px] bg-transparent"
          placeholder="Co se právě děje na tvé cestě? Napiš příběh..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 pt-4 border-t border-muted-foreground/10">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl border border-transparent focus-within:border-brand-300 transition-all">
                <span className="text-xl">📍</span>
                <input
                  type="text"
                  className="bg-transparent border-none focus:ring-0 w-full text-sm"
                  placeholder="Kde jsi? (Hledej adresu nebo místo)"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    searchAddress(e.target.value);
                  }}
                />
                <button 
                  type="button" 
                  onClick={getGeoLocation}
                  className="p-1 hover:bg-brand-50 rounded-lg text-brand-600 transition-colors"
                  title="Použít moji polohu"
                >
                  🎯
                </button>
              </div>

              {/* Výsledky hledání */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white shadow-2xl rounded-xl border border-muted overflow-hidden">
                  {searchResults.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-4 py-3 text-sm hover:bg-brand-50 border-b border-muted last:border-none transition-colors"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!content && !locationName)}
              className="btn btn-primary"
              style={{ padding: '10px 24px' }}
            >
              {isSubmitting ? "Publikuji..." : "Publikovat"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
