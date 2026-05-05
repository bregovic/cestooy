"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrace se nezdařila");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Nepodařilo se připojit k serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-brand-50" style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f7f7f0 100%)' }}>
      <div className="w-full max-w-[460px] bg-white border border-[#f0f0e6] rounded-[2rem] p-8 md:p-10 shadow-2xl relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="Cestooy" width={160} height={60} className="mb-6 h-auto w-auto object-contain" priority />
          <h2 className="text-xl font-bold tracking-tight text-[#1e293b]">Vytvořit účet</h2>
          <p className="text-[10px] text-[#8b8b43] font-bold uppercase tracking-[0.3em] mt-2">Začni svůj příběh ještě dnes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-[11px] font-bold">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#305555]/60 ml-1" htmlFor="name">
              Jméno a příjmení
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c5a1]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input
                id="name"
                type="text"
                className="w-full bg-[#f5f5ea]/30 border border-[#e2e2d0]/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#305555]/5 transition-all outline-none"
                placeholder="Jan Novák"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#305555]/60 ml-1" htmlFor="email">
              Emailová adresa
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c5a1]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                className="w-full bg-[#f5f5ea]/30 border border-[#e2e2d0]/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#305555]/5 transition-all outline-none"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#305555]/60 ml-1" htmlFor="password">
              Heslo
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c5a1]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                className="w-full bg-[#f5f5ea]/30 border border-[#e2e2d0]/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#305555]/5 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#030707] text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-6"
            disabled={loading}
          >
            {loading ? "Vytváření účtu..." : "Založit účet →"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#f0f0e6] text-center">
          <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">
            UŽ MÁŠ ÚČET?{" "}
            <Link href="/login" className="text-[#030707] font-black hover:underline underline-offset-4 ml-1">
              PŘIHLÁSIT SE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
