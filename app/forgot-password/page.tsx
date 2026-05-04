"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Chyba při odesílání");
      }
    } catch {
      setError("Chyba připojení");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-gradient)]">
      <div className="glass-panel w-full max-w-md p-10 animate-fade-in">
        
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="Cestooy" width={180} height={60} className="mb-6 h-auto w-auto" priority />
          <h2 className="text-xl font-bold tracking-tight text-brand-950">Zapomenuté heslo</h2>
          <p className="text-[11px] text-brand-400 font-bold uppercase tracking-[0.2em] mt-2 text-center">Pošleme ti záchranný odkaz</p>
        </div>

        {sent ? (
          <div className="text-center animate-slide-up">
            <div className="mb-8 p-6 bg-green-50 rounded-[2rem] border border-green-100">
              <div className="text-3xl mb-4">📧</div>
              <p className="text-xs font-bold text-green-700 leading-relaxed uppercase tracking-wider">
                Instrukce byly odeslány na tvůj email. Zkontroluj si schránku!
              </p>
            </div>
            <Link href="/login" className="block w-full bg-brand-950 text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-950/20 hover:scale-[1.02] transition-all">
              Zpět na přihlášení
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[11px] font-bold">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-500/60 ml-1">
                Tvůj registrovaný email
              </label>
              <input 
                type="email" 
                className="w-full bg-brand-50/30 border border-brand-100/50 rounded-2xl py-4 px-6 text-sm focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all outline-none" 
                placeholder="vas@email.cz" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-950 text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-950/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Odesílám..." : "Poslat odkaz →"}
            </button>
            
            <div className="text-center">
              <Link href="/login" className="text-[10px] font-bold text-brand-400 uppercase tracking-widest hover:text-brand-950 transition-colors">
                Zpět na přihlášení
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
