"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Nepodařilo se odeslat email");
        return;
      }

      setMessage("Instrukce pro obnovu hesla byly odeslány na váš email.");
    } catch {
      setError("Nepodařilo se připojit k serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-brand-50" style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f7f7f0 100%)' }}>
      <div className="w-full max-w-[420px] bg-white border border-[#f0f0e6] rounded-[2rem] p-8 md:p-10 shadow-2xl relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="Cestooy" width={160} height={60} className="mb-6 h-auto w-auto object-contain" priority />
          <h2 className="text-xl font-bold tracking-tight text-[#1e293b]">Obnova hesla</h2>
          <p className="text-[10px] text-[#8b8b43] font-bold uppercase tracking-[0.3em] mt-2">Pošleme ti instrukce k obnově</p>
        </div>

        {message ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
              ✉️
            </div>
            <p className="text-sm font-medium text-[#1e293b] leading-relaxed">
              {message}
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-[#030707] text-white px-8 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
            >
              Zpět na přihlášení
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-[11px] font-bold">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
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

              <button
                type="submit"
                className="w-full bg-[#030707] text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Odesílání..." : "Odeslat instrukce →"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-[11px] text-[#8b8b43] font-bold uppercase tracking-widest hover:text-[#305555] transition-colors">
                ← Zpět na přihlášení
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
