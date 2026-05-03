import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [unreadMessages, pendingFriends] = await Promise.all([
    prisma.chatMessage.count({ where: { receiverId: user.id, readAt: null } }),
    prisma.friendship.count({ where: { addresseeId: user.id, status: "PENDING" } }),
  ]);

  return (
    <DashboardShell 
      user={user} 
      unreadMessages={unreadMessages}
      pendingFriends={pendingFriends}
    >
      {children}
    </DashboardShell>
  );
}
