import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Dobré ráno" : hour < 18 ? "Dobré odpoledne" : "Dobrý večer";

  return (
    <div className="page-content animate-fade-in">
      <div className="mb-8">
        <h1 style={{ color: "var(--brand-600)", marginBottom: 8 }}>{greeting}, {user.name.split(" ")[0]}! 👋</h1>
        <p className="text-secondary">Vítej v Cestooy. Tvé dobrodružství začíná právě teď.</p>
      </div>

      <div className="grid-2 mb-8">
        <div className="card card-interactive">
          <div className="card-body" style={{ padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: "rgba(48, 85, 85, 0.15)", color: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 style={{ marginBottom: 12 }}>Moje cesty</h3>
            <p className="text-muted mb-6">Zatím nemáš žádné zaznamenané cesty. Začni tím, že si vytvoříš svůj první výlet.</p>
            <Link href="/dashboard/trips/new" className="btn btn-primary">Vytvořit první cestu</Link>
          </div>
        </div>

        <div className="card card-interactive">
          <div className="card-body" style={{ padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: "rgba(249, 165, 33, 0.15)", color: "var(--accent-600)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
              </svg>
            </div>
            <h3 style={{ marginBottom: 12 }}>Nástěnka příběhů</h3>
            <p className="text-muted mb-6">Sleduj příběhy svých přátel a inspiruj se jejich zážitky z celého světa.</p>
            <Link href="/dashboard/wall" className="btn btn-secondary">Prozkoumat nástěnku</Link>
          </div>
        </div>
      </div>

      <div className="card bg-muted" style={{ borderStyle: 'dashed' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: '2rem', marginBottom: 16 }}>🌍</div>
          <h4 style={{ marginBottom: 8 }}>Chystáme pro tebe mapu světa</h4>
          <p className="text-muted">Brzy si budeš moci zobrazit všechny své navštívené destinace na interaktivní mapě.</p>
        </div>
      </div>
    </div>
  );
}
