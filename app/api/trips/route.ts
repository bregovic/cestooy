import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/trips - Vytvoření nového výletu
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { title, description, startDate, endDate, isPublic } = body;

    if (!title) {
      return NextResponse.json({ error: "Název výletu je povinný" }, { status: 400 });
    }

    // Helper pro vytvoření slugu
    const slugify = (text: string) => text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Vytvoření výletu a automatické přidání majitele jako ADMIN člena
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        slug,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isPublic: isPublic || false,
        status: body.status || "PLANNING",
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN"
          }
        }
      }
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    console.error("[Trips POST]", err);
    return NextResponse.json({ error: "Chyba při vytváření výletu" }, { status: 500 });
  }
}

// GET /api/trips - Seznam mých výletů (vlastních i sdílených)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const trips = await prisma.trip.findMany({
      where: {
        AND: [
          {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } }
            ]
          },
          status ? { status: status as any } : {}
        ]
      },
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ trips });
  } catch (err) {
    console.error("[Trips GET]", err);
    return NextResponse.json({ error: "Chyba při načítání výletů" }, { status: 500 });
  }
}
