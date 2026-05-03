import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        bio: true, 
        avatar: true,
        blogSlug: true,
        blogTitle: true,
        blogTheme: true,
        blogHeaderImage: true,
        createdAt: true
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
    }

    return NextResponse.json(currentUser);
  } catch (err) {
    console.error("[GET /api/me]", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        bio: body.bio,
        avatar: body.avatar,
        blogSlug: body.blogSlug,
        blogTitle: body.blogTitle,
        blogTheme: body.blogTheme,
        blogHeaderImage: body.blogHeaderImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        blogSlug: true,
        blogTitle: true,
        blogTheme: true,
        blogHeaderImage: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("[PATCH /api/me]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
