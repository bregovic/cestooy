import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import PostComposer from "@/components/trips/PostComposer";
import DashboardFeed from "@/components/social/DashboardFeed";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cestooy | Moje Zeď",
};

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    const myTrips = await prisma.trip.findMany({
      where: { members: { some: { userId: user.id } } },
      orderBy: { createdAt: 'desc' },
      take: 3
    }).catch(() => []);

    const friendRequests = await prisma.friendship.findMany({
      where: { addresseeId: user.id, status: "PENDING" },
      include: { requester: { select: { name: true, avatar: true } } }
    }).catch(() => []);

    const firstName = user?.name ? user.name.split(" ")[0] : "Cestovateli";

    return (
      <div className="animate-fade-in pb-10">
        <div className="card p-20 text-center shadow-2xl" style={{ borderRadius: '2.5rem' }}>
          <h1 className="text-4xl font-black mb-4">Ahoj, {firstName}! 👋</h1>
          <p className="text-xl text-secondary">Dashboard se právě probouzí. Pokud vidíš tuhle zprávu, základní systém funguje!</p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/dashboard/trips" className="btn btn-primary px-8 py-4 rounded-2xl">Moje výlety</Link>
            <Link href="/dashboard/settings" className="btn btn-ghost px-8 py-4 rounded-2xl">Nastavení</Link>
          </div>
        </div>
        
        {/* Dočasně skrytý obsah pro debug */}
        <div className="mt-20 opacity-50 grayscale pointer-events-none">
           <h2 className="text-center font-bold mb-10 text-brand-900">Načítám zbytek světa...</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card h-40 bg-white/50" style={{ borderRadius: '2rem' }} />
              <div className="card h-40 bg-white/50" style={{ borderRadius: '2rem' }} />
           </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return (
      <div className="p-8 bg-red-50 text-red-900 border-2 border-red-200 rounded-3xl m-8">
        <h1 className="text-2xl font-bold mb-4">⚠️ Server Error in Dashboard Page</h1>
        <pre className="p-4 bg-black text-white rounded-xl overflow-auto text-xs">
          {error.message}
        </pre>
      </div>
    );
  }
}
