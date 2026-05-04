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

      <div className="tabs mb-10 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] shadow-lg border border-white inline-flex ring-1 ring-brand-100">
        <button className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === "profile" ? "bg-brand-950 text-white shadow-lg shadow-brand-200 scale-105" : "text-secondary hover:text-brand-900"}`} onClick={() => setTab("profile")}>👤 Profil</button>
        <button className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === "blog" ? "bg-brand-950 text-white shadow-lg shadow-brand-200 scale-105" : "text-secondary hover:text-brand-900"}`} onClick={() => setTab("blog")}>✍️ Můj Blog</button>
        <button className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === "security" ? "bg-brand-950 text-white shadow-lg shadow-brand-200 scale-105" : "text-secondary hover:text-brand-900"}`} onClick={() => setTab("security")}>🔒 Heslo</button>
      </div>

      {saved && <div className="p-4 bg-success-50 text-success rounded-2xl font-bold mb-8 animate-slide-up border border-success-100 flex items-center gap-3">
        <span className="text-xl">✅</span> Změny byly úspěšně uloženy!
      </div>}

      {tab === "profile" && (
        <div className="card shadow-2xl overflow-hidden border-none bg-white/80 backdrop-blur-xl ring-1 ring-white" style={{ borderRadius: '2.5rem' }}>
          <div className="p-10">
            <h3 className="text-xl font-black text-brand-950 mb-8 uppercase tracking-widest">Osobní informace</h3>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="user-avatar w-40 h-40 text-5xl shadow-2xl border-8 border-white cursor-pointer group relative overflow-hidden rounded-[2.5rem] bg-brand-100 ring-4 ring-brand-50"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : (user?.name?.[0] || "?")}
                  <div className="absolute inset-0 bg-brand-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black tracking-widest uppercase">ZMĚNIT</div>
                </div>
                <input type="file" id="avatar-input" hidden accept="image/*" onChange={(e) => onFileSelect(e, 'profile')} />
                <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline" onClick={() => document.getElementById('avatar-input')?.click()}>Změnit fotku 📸</button>
              </div>

              <div className="flex-1 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Jméno a příjmení</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-900 shadow-inner" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Něco o mně</label>
                  <textarea 
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-medium text-brand-950 min-h-[120px] shadow-inner" 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    placeholder="Cestovatel, dobrodruh, milovník dobrého jídla..." 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Email (nelze změnit)</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 font-bold outline-none cursor-not-allowed shadow-inner" 
                    value={user?.email} 
                    disabled 
                  />
                </div>
                <button 
                  className="btn btn-primary w-full md:w-auto px-12 py-5 rounded-2xl shadow-xl shadow-brand-200 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest" 
                  onClick={() => updateData({ name, bio })} 
                  disabled={saving}
                >
                  {saving ? "Ukládám..." : "Uložit profil ✨"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "blog" && (
        <div className="card shadow-2xl overflow-hidden border-none bg-white/80 backdrop-blur-xl ring-1 ring-white" style={{ borderRadius: '2.5rem' }}>
          <div className="p-10 space-y-10">
            <div>
              <h3 className="text-xl font-black text-brand-950 uppercase tracking-widest">Tvůj blogovací kanál ✍️</h3>
              <p className="text-secondary text-sm font-medium mt-1">Zde si nastavíš, jak bude vypadat tvá veřejná stránka.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Adresa blogu (Slug)</label>
                <div className="flex items-center gap-3">
                  <span className="text-brand-400 font-bold text-sm">cestooy.app/</span>
                  <input 
                    className="flex-1 px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-mono font-bold text-brand-600 shadow-inner" 
                    value={blogSlug} 
                    onChange={e => setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                    placeholder="tvoje-jmeno"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Název blogu</label>
                <input 
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-950 shadow-inner" 
                  value={blogTitle} 
                  onChange={e => setBlogTitle(e.target.value)} 
                  placeholder="Moje toulky světem" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Styl blogu (Téma)</label>
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-950 shadow-inner appearance-none" 
                  value={blogTheme} 
                  onChange={e => setBlogTheme(e.target.value)}
                >
                  <option value="MODERN">✨ Moderní (Čisté & Světlé)</option>
                  <option value="DARK">🌙 Noční (Tmavé & Elegantní)</option>
                  <option value="ADVENTURE">⛺ Dobrodružné (Zemitě barvy)</option>
                  <option value="MINIMAL">⚪ Minimalistické</option>
                </select>
              </div>
            </div>

            <div className="p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100 flex flex-col md:flex-row items-center gap-8 shadow-inner">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-xl ring-4 ring-brand-100/50">🎨</div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-brand-950 uppercase tracking-widest">Náhled tvého stylu</h4>
                <p className="text-xs text-brand-700 mt-2 font-medium">Tento styl se použije pro tvou hlavní stránku i jednotlivé příběhy, pokud si u nich nezvolíš jiný.</p>
              </div>
              <button 
                className="btn btn-primary px-10 py-5 rounded-2xl shadow-xl shadow-brand-200 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest" 
                onClick={() => updateData({ blogSlug, blogTitle, blogTheme })} 
                disabled={saving}
              >
                {saving ? "Ukládám..." : "Uložit styl ✨"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="card shadow-2xl overflow-hidden border-none bg-white/80 backdrop-blur-xl ring-1 ring-white max-w-lg" style={{ borderRadius: '2.5rem' }}>
          <div className="p-10">
            <h3 className="text-xl font-black text-brand-950 mb-8 uppercase tracking-widest">Bezpečnostní nastavení</h3>
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

  if (done) return <div className="p-8 bg-success-50 text-success rounded-[2rem] font-bold text-center border border-success-100 shadow-inner">✅ Heslo bylo úspěšně změněno!</div>;

  return (
    <form onSubmit={submit} className="space-y-8">
      {error && <div className="p-4 bg-danger-50 text-danger rounded-2xl text-sm font-bold border border-danger-100 animate-shake">{error}</div>}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Současné heslo</label>
        <input 
          type="password" 
          className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-950 shadow-inner" 
          value={current} 
          onChange={e => setCurrent(e.target.value)} 
          required 
        />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Nové heslo</label>
        <input 
          type="password" 
          className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-950 shadow-inner" 
          value={newP} 
          onChange={e => setNewP(e.target.value)} 
          required 
        />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-800 ml-1">Potvrzení nového hesla</label>
        <input 
          type="password" 
          className="w-full px-6 py-4 rounded-2xl bg-white border border-brand-100 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all font-bold text-brand-950 shadow-inner" 
          value={confirm} 
          onChange={e => setConfirm(e.target.value)} 
          required 
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary w-full py-5 rounded-2xl shadow-xl shadow-brand-200 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest" 
        disabled={saving}
      >
        {saving ? "Ukládám..." : "Změnit heslo 🔒"}
      </button>
    </form>
  );
}
