import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        owner: {
          select: { blogSlug: true, name: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        posts: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { loggedAt: "desc" }
        }
      }
    });

    if (!trip) {
      return NextResponse.json({ error: "Výlet nenalezen" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (err) {
    console.error("[GET /api/trips/[id]]", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    // Check if user is admin of the trip
    const member = await prisma.tripMember.findFirst({
      where: { tripId: id, userId: user.id, role: "ADMIN" }
    });

    if (!member && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        coverImage: body.coverImage,
        status: body.status,
      }
    });

    return NextResponse.json(updatedTrip);
  } catch (err) {
    console.error("[PATCH /api/trips/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
