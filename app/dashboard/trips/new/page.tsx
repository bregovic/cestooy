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
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted hover:text-brand-600 flex items-center gap-1 mb-4">
          ← Zpět na přehled
        </Link>
        <h1 className="text-3xl font-bold">Nový výlet 🎒</h1>
        <p className="text-secondary mt-2">Založ si novou množinu zážitků a pozvi přátele.</p>
      </div>

      <div className="card shadow-xl p-8" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Název výletu</label>
            <input
              required
              type="text"
              placeholder="Např. Itálie 2026, Víkend v kempu..."
              className="input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Popis (volitelné)</label>
            <textarea
              placeholder="O čem tento výlet bude?"
              className="input w-full min-h-[100px] py-3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Od</label>
              <input
                type="date"
                className="input w-full"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Do</label>
              <input
                type="date"
                className="input w-full"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
            <input
              type="checkbox"
              id="isPublic"
              className="w-5 h-5 rounded border-muted text-brand-600 focus:ring-brand-500"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            />
            <label htmlFor="isPublic" className="text-sm cursor-pointer">
              <strong>Veřejný výlet</strong> – kdokoli s odkazem si bude moct prohlédnout tvůj blog.
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-4 text-lg"
            >
              {isSubmitting ? "Vytvářím..." : "Vytvořit výlet 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
