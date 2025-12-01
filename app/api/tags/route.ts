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
      if (session.user.role === "SUPER_ADMIN") {
        // Super admin sees everything (all users, all statuses, public and private)
        // No filters applied
      } else if (showPrivate === "true") {
        where.userId = session.user.id;
        where.isPublic = false;
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
      orderBy: [
        { approvalStatus: "asc" }, // APPROVED first, then PENDING, then REJECTED
        { [sortField === "created_at" ? "createdAt" : sortField]: sortOrder },
      ],
    });

    // Deduplicate tags by name (case-insensitive), keeping the first one (which will be approved if exists)
    const uniqueTags = tags.reduce((acc: any[], tag) => {
      const existingTag = acc.find(
        (t) => t.name.toLowerCase() === tag.name.toLowerCase()
      );
      if (!existingTag) {
        acc.push(tag);
      }
      return acc;
    }, []);

    return NextResponse.json(uniqueTags);
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

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    // Check for duplicates across all users (case-insensitive)
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ],
      },
    });

    if (existingTag) {
      // Super admin can override rejected tags
      if (isSuperAdmin && existingTag.approvalStatus === "REJECTED") {
        // Delete the rejected tag and create new one
        await prisma.tag.delete({ where: { id: existingTag.id } });
      } else {
        return NextResponse.json(
          { error: "A tag with this name or slug already exists in the database" },
          { status: 400 }
        );
      }
    }

    // Determine approval status
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
