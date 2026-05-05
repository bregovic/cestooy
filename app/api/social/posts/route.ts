import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/social/posts - Získání příspěvků z nástěnky (moje a od přátel)
export async function GET() {
  try {
    const user = await requireAuth();

    // Získání ID přátel
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
    });

    const friendIds = friendships.map(f => 
      f.requesterId === user.id ? f.addresseeId : f.requesterId
    );

    // Moje ID i ID přátel
    const allVisibleIds = [...friendIds, user.id];

    const posts = await prisma.tripPost.findMany({
      where: {
        authorId: { in: allVisibleIds },
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        trip: { select: { id: true, title: true } },
        likes: {
          select: { userId: true }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      },
      orderBy: { loggedAt: "desc" },
      take: 50
    });

    // Obohacení o informaci, zda jsem post lajknul
    const enrichedPosts = posts.map(p => ({
      ...p,
      likedByMe: p.likes.some(l => l.userId === user.id)
    }));

    return NextResponse.json({ posts: enrichedPosts });
  } catch (err) {
    console.error("[GET /api/social/posts]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/social/posts - Vytvoření obecného příspěvku (mimo konkrétní výlet)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { 
      content, 
      type, 
      locationName, 
      lat, 
      lng, 
      tripId, 
      mediaUrls,
      amount,
      mileage,
      loggedAt 
    } = await req.json();

    if (!content && !locationName && !amount && !mileage) {
      return NextResponse.json({ error: "Záznam nesmí být prázdný" }, { status: 400 });
    }

    const post = await prisma.tripPost.create({
      data: {
        authorId: user.id,
        content: content?.trim(),
        type: type || "BLOG",
        locationName,
        lat,
        lng,
        tripId,
        mediaUrls: mediaUrls || [],
        amount: amount ? Number(amount) : null,
        mileage: mileage ? Number(mileage) : null,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        trip: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[POST /api/social/posts]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
