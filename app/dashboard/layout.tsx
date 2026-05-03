import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const [unreadMessages, pendingFriends] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: user.id, readAt: null } }),
      prisma.friendship.count({ where: { addresseeId: user.id, status: "PENDING" } }),
    ]).catch(err => {
      console.error("Prisma error in layout:", err);
      return [0, 0];
    });

    return (
      <DashboardShell 
        user={user} 
        unreadMessages={unreadMessages} 
        pendingFriends={pendingFriends}
      >
        {children}
      </DashboardShell>
    );
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return (
      <div style={{ padding: '2rem', background: '#fff1f2', color: '#991b1b', border: '2px solid #f87171', borderRadius: '1rem', margin: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚠️ Serverová chyba layoutu</h1>
        <pre style={{ marginTop: '1rem', padding: '1rem', background: '#000', color: '#fff', borderRadius: '0.5rem' }}>
          {error.message}
        </pre>
      </div>
    );
  }
}
