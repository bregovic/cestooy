"use client";

import dynamic from "next/dynamic";

// This is the bridge that allows using a client-only library (Leaflet) 
// within a Server Component by wrapping the dynamic import here.
const TripMap = dynamic(() => import("./TripMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-brand-50 animate-pulse" />
});

export default function MagazineMap({ points }: { points: any[] }) {
  return <TripMap points={points} />;
}
