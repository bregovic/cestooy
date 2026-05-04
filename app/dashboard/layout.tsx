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
    ]).catch(() => [0, 0]);

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
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return (
      <div className="p-8 bg-red-50 text-red-900 border-2 border-red-200 rounded-3xl m-8">
        <h1 className="text-2xl font-bold mb-4">⚠️ Server Error in Layout</h1>
        <pre className="p-4 bg-black text-white rounded-xl overflow-auto text-xs">
          {error.message}
        </pre>
      </div>
    );
  }
}
