"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
  badge?: number;
}

const IconProps = "w-5 h-5";

const UsersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const LayoutIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
  </svg>
);

const TripsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || IconProps}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

interface SidebarProps {
  user: User;
  unreadMessages?: number;
  pendingFriends?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  user, 
  unreadMessages = 0,
  pendingFriends = 0,
  isOpen = false,
  onClose
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Nástěnka", icon: LayoutIcon },
    { href: "/dashboard/chat", label: "Chat", icon: MessageSquareIcon, badge: unreadMessages },
    { href: "/dashboard/trips", label: "Akce", icon: TripsIcon },
    { href: "/dashboard/contacts", label: "Kontakty", icon: UsersIcon, badge: pendingFriends },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = (user?.name || "C")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      
      <aside className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-brand-100/50 z-[100] flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Logo Section */}
        <div className="p-8 border-b border-brand-50 flex items-center justify-between">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80" onClick={onClose}>
            <Image src="/logo.png" alt="Cestooy" width={120} height={40} className="h-auto w-auto" priority />
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-brand-300 hover:text-brand-950">✕</button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-1">
            <span className="block px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300 mb-4">Hlavní menu</span>
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard" 
                 ? pathname === "/dashboard" 
                 : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${isActive ? "bg-brand-50 text-brand-950" : "text-brand-400 hover:bg-brand-50/50 hover:text-brand-600"}`}
                  onClick={onClose}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-brand-600" : "text-brand-300"}`} />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto bg-brand-950 text-white text-[9px] font-black px-2 py-1 rounded-lg">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="block px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300 mb-4">Systém</span>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${pathname.startsWith("/dashboard/settings") ? "bg-brand-50 text-brand-950" : "text-brand-400 hover:bg-brand-50/50 hover:text-brand-600"}`}
              onClick={onClose}
            >
              <SettingsIcon className={`w-5 h-5 ${pathname.startsWith("/dashboard/settings") ? "text-brand-600" : "text-brand-300"}`} />
              <span>Nastavení</span>
            </Link>
          </div>
        </nav>

        {/* User Profile / Logout */}
        <div className="p-6 border-t border-brand-50 bg-brand-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 shadow-sm overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-brand-950 truncate">{user.name}</div>
              <div className="text-[9px] text-brand-400 truncate">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2.5 text-brand-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Odhlásit se"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
