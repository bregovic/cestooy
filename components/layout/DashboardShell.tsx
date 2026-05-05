"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import Image from "next/image";

interface DashboardShellProps {
  user: any;
  unreadMessages?: number;
  pendingFriends?: number;
  children: React.ReactNode;
}

export default function DashboardShell({ 
  user, 
  unreadMessages = 0,
  pendingFriends = 0,
  children 
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-brand-100/50 flex items-center px-4 z-50">
        <button 
          className="p-2 text-brand-400 hover:text-brand-950 transition-colors" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Otevřít menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        
        <div className="flex-1 flex justify-center mr-10">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="Cestooy" width={100} height={34} className="h-auto w-auto" priority />
          </Link>
        </div>
      </header>

      <Sidebar 
        user={user} 
        pendingFriends={pendingFriends}
        unreadMessages={unreadMessages}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 w-full lg:ml-[260px] p-6 lg:p-10 pt-24 lg:pt-10 max-w-[1600px] mx-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
