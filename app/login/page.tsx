"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Přihlášení se nezdařilo");
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-gradient)]">
      <div className="glass-panel w-full max-w-md p-10 animate-fade-in">
        
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="Cestooy" width={180} height={60} className="mb-6 h-auto w-auto" priority />
          <h2 className="text-xl font-bold tracking-tight text-brand-950">Vítej zpět</h2>
          <p className="text-[11px] text-brand-400 font-bold uppercase tracking-[0.2em] mt-2">Pokračuj ve svém příběhu</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-[11px] font-bold">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-500/60 ml-1" htmlFor="email">
                Emailová adresa
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300 group-focus-within:text-brand-500 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full bg-brand-50/30 border border-brand-100/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-500/60" htmlFor="password">
                  Heslo
                </label>
                <Link href="/forgot-password" size="sm" className="text-[9px] font-bold text-brand-400 hover:text-brand-600">
                  Zapomenuto?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300 group-focus-within:text-brand-500 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full bg-brand-50/30 border border-brand-100/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-950 text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-950/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? "Ověřování..." : "Přihlásit se →"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-brand-100/50 text-center">
          <p className="text-[11px] text-brand-400 font-bold uppercase tracking-widest">
            Ještě nemáš účet?{" "}
            <Link href="/register" className="text-brand-950 hover:opacity-70 transition-opacity ml-1">
              Založ si ho zdarma
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
