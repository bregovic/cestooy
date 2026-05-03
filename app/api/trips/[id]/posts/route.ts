import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/trips/[id]/posts - Vytvoření nového příspěvku (foto, blog, check-in)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const tripId = params.id;
    const body = await req.json();

    const { content, mediaUrls, type, lat, lng, locationName } = body;

    // Ověření, že uživatel má k výletu přístup
    const membership = await prisma.tripMember.findFirst({
      where: {
        tripId,
        userId: user.id,
      },
    });

    const isOwner = await prisma.trip.findFirst({
      where: { id: tripId, ownerId: user.id }
    });

    if (!membership && !isOwner) {
      return NextResponse.json({ error: "Nemáš přístup k tomuto výletu" }, { status: 403 });
    }

    const post = await prisma.tripPost.create({
      data: {
        tripId,
        authorId: user.id,
        content: content || null,
        mediaUrls: mediaUrls || [],
        type: type || "PHOTO",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        locationName: locationName || null,
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[TripPost POST]", err);
    return NextResponse.json({ error: "Chyba při ukládání příspěvku" }, { status: 500 });
  }
}

// GET /api/trips/[id]/posts - Získání všech příspěvků pro daný výlet
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    const posts = await prisma.tripPost.findMany({
      where: { tripId },
      include: {
        author: {
          select: { name: true, avatar: true }
        },
        likes: true,
        _count: {
          select: { comments: true, likes: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("[TripPost GET]", err);
    return NextResponse.json({ error: "Chyba při načítání příspěvků" }, { status: 500 });
  }
}
