"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapPoint {
  id: string;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  type: string;
}

interface TripMapProps {
  points: MapPoint[];
  isMini?: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function TripMap({ points, isMini }: TripMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fixLeafletIcons();
  }, []);

  const validPoints = points.filter(p => p.lat !== null && p.lng !== null) as (MapPoint & { lat: number; lng: number })[];
  
  if (!mounted || validPoints.length === 0) {
    return (
      <div className="w-full h-full bg-brand-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-brand-300">
        Mapa se připravuje... 🗺️
      </div>
    );
  }

  const positions = validPoints.map(p => [p.lat, p.lng] as [number, number]);
  const lastPoint = positions[positions.length - 1];

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={lastPoint} 
        zoom={isMini ? 15 : 13} 
        scrollWheelZoom={false}
        zoomControl={!isMini}
        className="w-full h-full"
      >
        <TileLayer
          attribution={isMini ? "" : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* The Path */}
        <Polyline 
          positions={positions} 
          pathOptions={{ 
            color: '#1e3a3a', 
            weight: 4, 
            opacity: 0.6,
            dashArray: '1, 10' 
          }} 
        />

        {/* Markers */}
        {validPoints.map((p, idx) => {
          const isLast = idx === validPoints.length - 1;
          return (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] font-black uppercase tracking-tight text-brand-950 mb-1">{p.locationName || "Zastávka"}</div>
                  {isLast && <div className="text-[9px] font-bold text-brand-500 uppercase">📍 Aktuální poloha</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <ChangeView center={lastPoint} />
      </MapContainer>
    </div>
  );
}
