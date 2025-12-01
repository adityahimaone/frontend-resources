import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const slug = searchParams.get("slug");
    const showPrivate = searchParams.get("showPrivate");
    const showPending = searchParams.get("showPending");

    // If slug is provided, return single category
    if (slug) {
      const category = await prisma.category.findFirst({
        where: { 
          slug,
          OR: [
            { isPublic: true, approvalStatus: "APPROVED" },
            ...(session?.user ? [{ userId: session.user.id }] : []),
          ],
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

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

    const categories = await prisma.category.findMany({
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

    // Deduplicate categories by name (case-insensitive), keeping the first one (which will be approved if exists)
    const uniqueCategories = categories.reduce((acc: any[], category) => {
      const existingCategory = acc.find(
        (c) => c.name.toLowerCase() === category.name.toLowerCase()
      );
      if (!existingCategory) {
        acc.push(category);
      }
      return acc;
    }, []);

    return NextResponse.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, isPublic = true } = body;

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    // Check for duplicates across all users (case-insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ],
      },
    });

    if (existingCategory) {
      // Super admin can override rejected categories
      if (isSuperAdmin && existingCategory.approvalStatus === "REJECTED") {
        // Delete the rejected category and create new one
        await prisma.category.delete({ where: { id: existingCategory.id } });
      } else {
        return NextResponse.json(
          { error: "A category with this name or slug already exists in the database" },
          { status: 400 }
        );
      }
    }

    // Determine approval status
    const approvalStatus = isPublic && !isSuperAdmin ? "PENDING" : "APPROVED";

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        userId: session.user.id,
        isPublic,
        approvalStatus,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
