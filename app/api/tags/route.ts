import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const showPrivate = searchParams.get("showPrivate");
    const showPending = searchParams.get("showPending");

    const where: any = {};

    // Filter by visibility and approval status
    if (session?.user) {
      if (showPrivate === "true") {
        where.userId = session.user.id;
        where.isPublic = false;
      } else if (showPending === "true" && session.user.role === "SUPER_ADMIN") {
        where.approvalStatus = "PENDING";
        where.isPublic = true;
      } else {
        where.OR = [
          { isPublic: true, approvalStatus: "APPROVED" },
          { userId: session.user.id },
        ];
      }
    } else {
      where.isPublic = true;
      where.approvalStatus = "APPROVED";
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        [sortField === "created_at" ? "createdAt" : sortField]: sortOrder,
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, isPublic = true } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check for duplicates
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name, userId: session.user.id },
          { slug, userId: session.user.id },
        ],
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this name or slug already exists" },
        { status: 400 }
      );
    }

    // Determine approval status
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const approvalStatus = isPublic && !isSuperAdmin ? "PENDING" : "APPROVED";

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        color,
        userId: session.user.id,
        isPublic,
        approvalStatus,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
