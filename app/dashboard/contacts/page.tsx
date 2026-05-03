"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";

interface Friendship {
  id: string;
  status: string;
  requesterId: string;
  addresseeId: string;
  message: string | null;
  createdAt: string;
  acceptedAt: string | null;
  requester: { id: string; name: string; email: string; avatar: string | null };
  addressee: { id: string; name: string; email: string; avatar: string | null };
}

export default function ContactsPage() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  async function load() {
    try {
      const [fsRes, meRes] = await Promise.all([
        fetch("/api/contacts"),
        fetch("/api/me"),
      ]);
      const data = await fsRes.json();
      const me = await meRes.json();
      setFriendships(Array.isArray(data.friendships) ? data.friendships : []);
      setCurrentUserId(me?.id || "");
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function sendRequest() {
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, message: inviteMsg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Chyba při odesílání žádosti");
      } else {
        setInviteSuccess(`Žádost odeslána na ${inviteEmail} ✓`);
        setInviteEmail("");
        setInviteMsg("");
        load();
      }
    } catch (err) {
      setInviteError("Chyba spojení se serverem");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleAction(id: string, action: string) {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Opravdu chceš odebrat tohoto přítele?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    load();
  }

  const accepted = friendships.filter((f) => f.status === "ACCEPTED");
  const pending = friendships.filter((f) => f.status === "PENDING");
  const pendingIncoming = pending.filter((f) => f.addresseeId === currentUserId);
  const pendingOutgoing = pending.filter((f) => f.requesterId === currentUserId);

  const getOther = (f: Friendship) =>
    f.requesterId === currentUserId ? f.addressee : f.requester;

  const Initials = ({ name, avatar }: { name: string; avatar?: string | null }) => (
    <div className="user-avatar" style={{ width: 40, height: 40, fontSize: "0.9rem", flexShrink: 0, overflow: 'hidden' }}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      )}
    </div>
  );

  return (
    <div className="page-content animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Přátelé 👥</h1>
          <p className="text-secondary">Lidé, se kterými sdílíš své cesty a zážitky.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Přidat přítele
        </button>
      </div>

      {/* Pending incoming */}
      {pendingIncoming.length > 0 && (
        <div className="card shadow-lg mb-8 overflow-hidden" style={{ border: '2px solid var(--brand-200)' }}>
          <div className="p-4 bg-brand-50 flex items-center justify-between border-b">
            <h3 className="font-bold text-brand-900">📬 Příchozí žádosti o přátelství</h3>
            <span className="badge badge-brand">{pendingIncoming.length}</span>
          </div>
          <div className="divide-y divide-muted/10">
            {pendingIncoming.map((f) => {
              const other = getOther(f);
              return (
                <div key={f.id} className="p-4 flex items-center gap-4 hover:bg-muted/5 transition-colors">
                  <Initials name={other.name} avatar={other.avatar} />
                  <div className="flex-1">
                    <div className="font-bold">{other.name}</div>
                    <div className="text-xs text-muted">{other.email}</div>
                    {f.message && <div className="text-sm italic mt-1 text-secondary">„{f.message}"</div>}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAction(f.id, "accept")}>Přijmout</button>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleAction(f.id, "reject")}>Odmítnout</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accepted contacts */}
      <div className="card shadow-xl overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Moji přátelé</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : accepted.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏜️</div>
              <h4 className="text-lg font-bold">Zatím tu nikdo není</h4>
              <p className="text-secondary max-w-xs mx-auto mt-2">Přidej své první přátele, abys mohl sledovat jejich cesty nebo plánovat společné výlety.</p>
              <button className="btn btn-outline mt-6" onClick={() => setShowModal(true)}>Najít přátele</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accepted.map((f) => {
                const other = getOther(f);
                return (
                  <div key={f.id} className="p-4 rounded-2xl border border-muted hover:border-brand-300 hover:shadow-md transition-all flex items-center gap-4 group">
                    <Initials name={other.name} avatar={other.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{other.name}</div>
                      <div className="text-xs text-muted truncate">{other.email}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/chat/${other.id}`} className="btn btn-ghost btn-sm btn-icon" title="Napsat zprávu">💬</Link>
                      <button className="btn btn-ghost btn-sm btn-icon text-danger" onClick={() => remove(f.id)} title="Odebrat">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending outgoing */}
      {pendingOutgoing.length > 0 && (
        <div className="card shadow-md overflow-hidden bg-muted/20">
          <div className="p-4 border-b">
            <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">📤 Odeslané žádosti</h3>
          </div>
          <div className="divide-y divide-muted/10">
            {pendingOutgoing.map((f) => {
              const other = getOther(f);
              return (
                <div key={f.id} className="p-4 flex items-center gap-4">
                  <Initials name={other.name} avatar={other.avatar} />
                  <div className="flex-1">
                    <div className="font-bold">{other.name}</div>
                    <div className="text-xs text-muted">Čeká na schválení...</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(f.id)}>Zrušit</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add friend modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Přidat přítele 🔍</h3>
                <button className="text-muted hover:text-primary" onClick={() => setShowModal(false)}>✕</button>
              </div>
              
              <div className="space-y-6">
                {inviteError && <div className="p-4 bg-danger-50 text-danger rounded-xl text-sm">{inviteError}</div>}
                {inviteSuccess && <div className="p-4 bg-success-50 text-success rounded-xl text-sm">{inviteSuccess}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Email přítele</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="kamarad@cestooy.app"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-muted ml-1">Zadej email člověka, který už je na Cestooy.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Zpráva (nepovinná)</label>
                  <textarea
                    className="input w-full min-h-[80px] py-3"
                    placeholder="Čau, přidej si mě, ať můžeme sdílet výlety!"
                    value={inviteMsg}
                    onChange={(e) => setInviteMsg(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary w-full py-4"
                  onClick={sendRequest}
                  disabled={inviteLoading || !inviteEmail}
                >
                  {inviteLoading ? "Odesílám..." : "Odeslat žádost ✉️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
