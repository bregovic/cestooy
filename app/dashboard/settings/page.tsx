"use client";

import { useState, useEffect } from "react";
import AvatarEditor from "@/components/common/AvatarEditor";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  blogSlug?: string;
  blogTitle?: string;
  blogTheme?: string;
  blogHeaderImage?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogTheme, setBlogTheme] = useState("MODERN");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "blog" | "security">("profile");
  const [editorTarget, setEditorTarget] = useState<null | 'profile' | 'blog'>(null);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => {
      if (data && !data.error) {
        setUser(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setAvatar(data.avatar || "");
        setBlogSlug(data.blogSlug || "");
        setBlogTitle(data.blogTitle || "");
        setBlogTheme(data.blogTheme || "MODERN");
      }
    });
  }, []);

  async function updateData(partial: any) {
    setSaving(true);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'blog') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditorImage(reader.result?.toString() || null);
        setEditorTarget(target);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="page-content animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nastavení ⚙️</h1>

      <div className="tabs mb-8 bg-white p-2 rounded-2xl shadow-sm border border-muted inline-flex">
        <button className={`btn ${tab === "profile" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("profile")}>👤 Profil</button>
        <button className={`btn ${tab === "blog" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("blog")}>✍️ Můj Blog</button>
        <button className={`btn ${tab === "security" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("security")}>🔒 Bezpečnost</button>
      </div>

      {saved && <div className="alert alert-success mb-6 animate-slide-up">✅ Změny byly úspěšně uloženy!</div>}

      {tab === "profile" && (
        <div className="card shadow-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Osobní informace</h3>
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="user-avatar w-32 h-32 text-4xl shadow-lg border-4 border-brand-100 cursor-pointer group relative overflow-hidden"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user?.name?.[0] || "?")}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">ZMĚNIT</div>
                </div>
                <input type="file" id="avatar-input" hidden accept="image/*" onChange={(e) => onFileSelect(e, 'profile')} />
                <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById('avatar-input')?.click()}>Změnit fotku</button>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Jméno a příjmení</label>
                  <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Něco o mně</label>
                  <textarea className="input w-full min-h-[100px] py-3" value={bio} onChange={e => setBio(e.target.value)} placeholder="Cestovatel, dobrodruh, milovník dobrého jídla..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Email (nelze změnit)</label>
                  <input className="input w-full opacity-60" value={user?.email} disabled />
                </div>
                <button className="btn btn-primary px-10 py-4" onClick={() => updateData({ name, bio })} disabled={saving}>
                  {saving ? "Ukládám..." : "Uložit profil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "blog" && (
        <div className="card shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold">Tvůj blogovací kanál ✍️</h3>
              <p className="text-secondary text-sm">Zde si nastavíš, jak bude vypadat tvá veřejná stránka.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Adresa blogu (Slug)</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-sm">cestooy.app/</span>
                  <input 
                    className="input flex-1 font-mono text-sm" 
                    value={blogSlug} 
                    onChange={e => setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                    placeholder="tvoje-jmeno"
                  />
                </div>
                <p className="text-[10px] text-muted">Pouze malá písmena, čísla a pomlčky.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Název blogu</label>
                <input className="input w-full" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="Moje toulky světem" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Styl blogu (Téma)</label>
                <select className="input w-full" value={blogTheme} onChange={e => setBlogTheme(e.target.value)}>
                  <option value="MODERN">✨ Moderní (Čisté & Světlé)</option>
                  <option value="DARK">🌙 Noční (Tmavé & Elegantní)</option>
                  <option value="ADVENTURE">⛺ Dobrodružné (Zemitě barvy)</option>
                  <option value="MINIMAL">⚪ Minimalistické</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-brand-50 rounded-[2rem] border border-brand-100 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-inner">🎨</div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold">Náhled tvého stylu</h4>
                <p className="text-xs text-secondary mt-1">Tento styl se použije pro tvou hlavní stránku i jednotlivé příběhy, pokud si u nich nezvolíš jiný.</p>
              </div>
              <button className="btn btn-primary" onClick={() => updateData({ blogSlug, blogTitle, blogTheme })} disabled={saving}>
                {saving ? "Ukládám..." : "Uložit nastavení blogu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="card shadow-xl overflow-hidden max-w-lg">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Změna hesla</h3>
            <PasswordChangeForm />
          </div>
        </div>
      )}

      {editorTarget && (
        <AvatarEditor 
          initialImage={editorImage}
          onCancel={() => { setEditorTarget(null); setEditorImage(null); }}
          onSave={async (base64) => {
            if (editorTarget === 'profile') {
              setAvatar(base64);
              await updateData({ avatar: base64 });
            }
            setEditorTarget(null);
            setEditorImage(null);
          }}
        />
      )}
    </div>
  );
}

function PasswordChangeForm() {
  const [current, setCurrent] = useState("");
  const [newP, setNewP] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newP !== confirm) return setError("Hesla se neshodují");
    setSaving(true);
    const res = await fetch("/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newP }),
    });
    if (res.ok) { setDone(true); }
    else { const d = await res.json(); setError(d.error || "Chyba"); }
    setSaving(false);
  }

  if (done) return <div className="p-6 bg-success-50 text-success rounded-2xl font-bold text-center">✅ Heslo bylo úspěšně změněno!</div>;

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div className="p-4 bg-danger-50 text-danger rounded-xl text-sm">{error}</div>}
      <div className="space-y-2"><label className="text-sm font-bold ml-1">Současné heslo</label><input type="password" className="input w-full" value={current} onChange={e => setCurrent(e.target.value)} required /></div>
      <div className="space-y-2"><label className="text-sm font-bold ml-1">Nové heslo</label><input type="password" className="input w-full" value={newP} onChange={e => setNewP(e.target.value)} required /></div>
      <div className="space-y-2"><label className="text-sm font-bold ml-1">Potvrzení nového hesla</label><input type="password" className="input w-full" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
      <button type="submit" className="btn btn-primary w-full py-4" disabled={saving}>{saving ? "Ukládám..." : "Změnit heslo"}</button>
    </form>
  );
}
