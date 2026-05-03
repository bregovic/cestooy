"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, string>;
  createdAt: string;
  readAt: string | null;
}

const NOTIF_ICONS: Record<string, string> = {
  FRIEND_REQUEST_RECEIVED: "👋",
  FRIEND_REQUEST_ACCEPTED: "🤝",
  CHAT_MESSAGE_RECEIVED: "💬",
  NEW_POST_FRIEND: "📢",
  TRIP_INVITATION: "🎒",
  EXPENSE_CREATED: "💰",
};

const NOTIF_LABELS: Record<string, string> = {
  FRIEND_REQUEST_RECEIVED: "Nová žádost o přátelství",
  FRIEND_REQUEST_ACCEPTED: "Přátelství navázáno",
  CHAT_MESSAGE_RECEIVED: "Nová zpráva",
  NEW_POST_FRIEND: "Nový příspěvek",
  TRIP_INVITATION: "Pozvánka do výletu",
  EXPENSE_CREATED: "Nový výdaj ve výletu",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: "all" }),
    });
    load();
    router.refresh();
  }

  async function markAsRead(id: string) {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.readAt) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    load();
    router.refresh();
  }

  useEffect(() => { load(); }, []);

  const unread = notifications.filter((n) => !n.readAt).length;

  const fmtDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return "právě teď";
    if (diff < 3600) return `před ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `před ${Math.floor(diff / 3600)} hod`;
    return date.toLocaleDateString("cs-CZ");
  };

  return (
    <div className="page-content animate-fade-in max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifikace 🔔</h1>
          <p className="text-secondary">Vše důležité, co se na tvých cestách děje.</p>
        </div>
        {unread > 0 && (
          <button
            className="btn btn-ghost btn-sm text-brand-600 font-bold"
            onClick={markAllRead}
          >
            ✓ Označit vše jako přečtené
          </button>
        )}
      </div>

      <div className="card shadow-xl overflow-hidden" style={{ borderRadius: 'var(--radius-2xl)' }}>
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold">Klid a mír</h3>
            <p className="text-secondary mt-2">Momentálně nemáš žádné nové zprávy.</p>
          </div>
        ) : (
          <div className="divide-y divide-muted/10">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-4 p-5 transition-all cursor-pointer ${!n.readAt ? 'bg-brand-50/30' : 'hover:bg-muted/5'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-muted/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {NOTIF_ICONS[n.type] || "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${!n.readAt ? 'font-bold' : 'font-medium'}`}>
                    {n.type === 'FRIEND_REQUEST_ACCEPTED' && n.payload?.friendName 
                      ? `${n.payload.friendName} přijal(a) tvou žádost o přátelství`
                      : n.type === 'CHAT_MESSAGE_RECEIVED' && n.payload?.senderName
                      ? `Nová zpráva od: ${n.payload.senderName}`
                      : n.type === 'NEW_POST_FRIEND' && n.payload?.authorName
                      ? `${n.payload.authorName} přidal(a) nový zážitek`
                      : n.type === 'TRIP_INVITATION' && n.payload?.tripTitle
                      ? `Byl(a) jsi pozván(a) do výletu: ${n.payload.tripTitle}`
                      : (NOTIF_LABELS[n.type] || n.type)}
                  </div>
                  <div className="text-xs text-muted mt-1">{fmtDate(n.createdAt)}</div>
                </div>
                {!n.readAt && <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
