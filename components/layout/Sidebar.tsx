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
  icon: React.ReactNode;
  badge?: number;
}

const LayoutGridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const LayoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
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
    { href: "/dashboard", label: "Přehled", icon: <LayoutGridIcon /> },
    { href: "/dashboard/wall", label: "Nástěnka", icon: <LayoutIcon /> },
    { href: "/dashboard/chat", label: "Chat", icon: <MessageSquareIcon />, badge: unreadMessages },
    { href: "/dashboard/trips", label: "Moje cesty", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ) },
    { href: "/dashboard/contacts", label: "Kontakty", icon: <UsersIcon />, badge: pendingFriends },
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
      
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div className="sidebar-logo" style={{ justifyContent: 'space-between', padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <Link href="/dashboard" className="flex transition-opacity hover:opacity-80" onClick={onClose}>
            <Image src="/logo.png" alt="Cestooy" width={140} height={60} style={{ objectFit: 'contain', height: 'auto' }} priority />
          </Link>
          
          <button 
            className="btn btn-ghost btn-icon md:hidden" 
            onClick={onClose}
            style={{ display: isOpen ? 'flex' : 'none' }}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Hlavní navigace">
          <span className="nav-section-label">Hlavní menu</span>
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" 
               ? pathname === "/dashboard" 
               : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                id={`nav-${item.href.split("/").pop()}`}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="nav-badge">{item.badge}</span>
                ) : null}
              </Link>
            );
          })}

          <span className="nav-section-label" style={{ marginTop: 8 }}>Nastavení</span>
          <Link
            href="/dashboard/settings"
            className={`nav-item ${pathname.startsWith("/dashboard/settings") ? "active" : ""}`}
            id="nav-settings"
            onClick={onClose}
          >
            <SettingsIcon />
            <span>Nastavení</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" id="sidebar-user-card">
            <div className="user-avatar">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={36} height={36} />
              ) : (
                initials
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-ghost btn-icon"
              id="logout-btn"
              data-tooltip="Odhlásit se"
              style={{ marginLeft: "auto", flexShrink: 0 }}
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
