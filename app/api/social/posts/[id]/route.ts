import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const post = await prisma.tripPost.findUnique({
      where: { id },
      include: {
        author: { select: { blogSlug: true } },
        trip: { select: { slug: true } }
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen" }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.tripPost.update({
      where: { id },
      data: {
        content: body.content !== undefined ? body.content : undefined,
        mediaUrls: body.mediaUrls !== undefined ? body.mediaUrls : undefined,
        type: body.type !== undefined ? body.type : undefined,
        lat: body.lat !== undefined ? body.lat : undefined,
        lng: body.lng !== undefined ? body.lng : undefined,
        locationName: body.locationName !== undefined ? body.locationName : undefined,
        amount: body.amount !== undefined ? body.amount : undefined,
        mileage: body.mileage !== undefined ? body.mileage : undefined,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : undefined,
      }
    });

    // Revalidate paths
    if (post.author.blogSlug) {
      revalidatePath(`/${post.author.blogSlug}`);
      if (post.trip?.slug) {
        revalidatePath(`/${post.author.blogSlug}/${post.trip.slug}`);
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/social/posts/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const post = await prisma.tripPost.findUnique({
      where: { id },
      include: {
        author: { select: { blogSlug: true } },
        trip: { select: { slug: true } }
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen" }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.tripPost.delete({
      where: { id }
    });

    // Revalidate paths
    if (post.author.blogSlug) {
      revalidatePath(`/${post.author.blogSlug}`);
      if (post.trip?.slug) {
        revalidatePath(`/${post.author.blogSlug}/${post.trip.slug}`);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/social/posts/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
