import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/contacts - Seznam přátel a žádostí
export async function GET() {
  try {
    const user = await requireAuth();

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { addresseeId: user.id },
        ],
      },
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
        addressee: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ friendships, invitations: [] });
  } catch (err) {
    console.error("[GET /api/contacts]", err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

// POST /api/contacts - Odeslání žádosti o přátelství
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { email, message } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();

    if (targetEmail === user.email.toLowerCase()) {
      return NextResponse.json({ error: "Nemůžeš si poslat žádost sám sobě 🫠" }, { status: 400 });
    }

    const addressee = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (!addressee) {
      return NextResponse.json({ error: "Uživatel s tímto emailem zatím na Cestooy není. Pozvi ho sdílením odkazu!" }, { status: 404 });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Už jste propojeni" }, { status: 409 });
      }
      return NextResponse.json({ error: "Žádost už byla odeslána" }, { status: 409 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: addressee.id,
        message: message || null,
        status: "PENDING",
      },
      include: {
        addressee: { select: { id: true, name: true, email: true } },
      },
    });

    // Email notifikace
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/email");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const template = emailTemplates.friendRequestReceived(addressee.name, user.name, `${appUrl}/dashboard/contacts`);
      await sendEmail({ to: addressee.email, subject: template.subject, html: template.html });
    } catch (e) {
      console.warn("[Email] Failed to notify friend request", e);
    }

    return NextResponse.json(friendship, { status: 201 });
  } catch (err) {
    console.error("[POST /api/contacts]", err);
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 });
  }
}
