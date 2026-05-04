"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";

export default function NewTripPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const trip = await res.json();
        router.push(`/dashboard/trips/${trip.id}`);
      } else {
        alert("Něco se nepovedlo. Zkus to prosím znovu.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content animate-fade-in max-w-2xl mx-auto">
      <div className="mb-12">
        <Link href="/dashboard/trips" className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-brand-600 flex items-center gap-2 mb-6">
          ← Zpět na seznam akcí
        </Link>
        <h1 className="text-4xl font-black text-brand-950 uppercase tracking-tight">Nová Akce 📅</h1>
        <p className="text-secondary mt-2 font-medium">Založ si ucelený příběh, sdílej blog a pozvi přátele do skupiny.</p>
      </div>

      <div className="card shadow-2xl p-10 bg-white/80 backdrop-blur-xl border border-white" style={{ borderRadius: '3rem' }}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-2">Název akce</label>
            <input
              required
              type="text"
              placeholder="Např. Itálie 2026, Víkend na horách..."
              className="input w-full p-6 bg-white/50 border-brand-50 rounded-2xl focus:bg-white transition-all text-lg font-bold"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-2">Popis (volitelné)</label>
            <textarea
              placeholder="Krátce popiš, o čem tato akce bude..."
              className="input w-full min-h-[120px] p-6 bg-white/50 border-brand-50 rounded-2xl focus:bg-white transition-all font-medium"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-2">Začátek</label>
              <input
                type="date"
                className="input w-full p-5 bg-white/50 border-brand-50 rounded-2xl focus:bg-white transition-all font-bold"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-2">Konec</label>
              <input
                type="date"
                className="input w-full p-5 bg-white/50 border-brand-50 rounded-2xl focus:bg-white transition-all font-bold"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-brand-50/50 rounded-3xl border border-brand-50">
            <input
              type="checkbox"
              id="isPublic"
              className="w-6 h-6 rounded-lg border-brand-200 text-brand-600 focus:ring-brand-500"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            />
            <label htmlFor="isPublic" className="text-sm cursor-pointer font-medium text-brand-900 select-none">
              <strong>Veřejná akce</strong> – kdokoli s odkazem uvidí tvůj blog.
            </label>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-200 hover:scale-[1.02] transition-all"
            >
              {isSubmitting ? "Vytvářím..." : "Založit Akci 🚀"}
            </button>
          </div>
        </form>
      </div>
        </form>
      </div>
    </div>
  );
}
