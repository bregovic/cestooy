"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  user: any;
  unreadNotifs: number;
  unreadMessages?: number;
  pendingFriends?: number;
  children: React.ReactNode;
}

export default function DashboardShell({ 
  user, 
  unreadNotifs, 
  unreadMessages = 0,
  pendingFriends = 0,
  children 
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="app-shell">
      {/* Mobile Topbar */}
      <header className="mobile-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <button 
          className="btn btn-ghost btn-icon" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Otevřít menu"
          style={{ flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        
        {/* Centered logo */}
        <Link 
          href="/dashboard" 
          style={{ 
            position: "absolute", 
            left: "50%", 
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "44px",
          }}
        >
          <Image 
            src="/logo.png" 
            alt="Cestooy" 
            width={110} 
            height={38} 
            style={{ objectFit: 'contain', maxHeight: 38 }} 
            priority
          />
        </Link>
        
        <div style={{ width: 40, flexShrink: 0 }} />
      </header>
      <div className="mobile-header-divider" />

      <Sidebar 
        user={user} 
        unreadNotifs={unreadNotifs} 
        pendingFriends={pendingFriends}
        unreadMessages={unreadMessages}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
