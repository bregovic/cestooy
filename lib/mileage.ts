interface Post {
  id: string;
  lat: number | null;
  lng: number | null;
  mileage: number | null;
  loggedAt: Date | string;
  [key: string]: any;
}

/**
 * Haversine distance between two points in km
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recalculates mileage for all posts based on manual mileage entries and GPS distances.
 */
export function calculateExpeditionMileage<T extends Post>(posts: T[]): (T & { displayMileage: number | null })[] {
  // Sort by time first
  const sorted = [...posts].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  
  const result = sorted.map(p => ({ ...p, displayMileage: p.mileage }));

  // Find segments between manual mileage entries
  let lastMileageIdx = -1;

  for (let i = 0; i < result.length; i++) {
    if (result[i].mileage !== null) {
      if (lastMileageIdx !== -1) {
        // We have a segment from lastMileageIdx to i
        const startPost = result[lastMileageIdx];
        const endPost = result[i];
        const manualDelta = (endPost.mileage || 0) - (startPost.mileage || 0);

        if (manualDelta > 0) {
          // Calculate GPS total for this segment
          let gpsTotal = 0;
          const segmentDistances: number[] = [];
          
          for (let j = lastMileageIdx; j < i; j++) {
            const p1 = result[j];
            const p2 = result[j+1];
            if (p1.lat && p1.lng && p2.lat && p2.lng) {
              const d = getDistance(p1.lat, p1.lng, p2.lat, p2.lng);
              gpsTotal += d;
              segmentDistances.push(d);
            } else {
              segmentDistances.push(0);
            }
          }

          // Distribute manual delta proportionally to GPS distances
          if (gpsTotal > 0) {
            let currentMileage = startPost.mileage || 0;
            const factor = manualDelta / gpsTotal;
            
            for (let j = lastMileageIdx + 1; j < i; j++) {
              currentMileage += segmentDistances[j - lastMileageIdx - 1] * factor;
              result[j].displayMileage = Math.round(currentMileage);
            }
          }
        }
      }
      lastMileageIdx = i;
    }
  }

  // Handle points before first mileage entry or after last? 
  // For now we only care about the spans between entries.

  return result;
}
