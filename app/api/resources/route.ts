import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";

// GET /api/resources - Get all resources
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const isHot = searchParams.get("isHot");
    const isTrending = searchParams.get("isTrending");
    const showPrivate = searchParams.get("showPrivate");
    const showPending = searchParams.get("showPending");

    const where: any = {};

    // Filter by visibility and approval status
    if (session?.user) {
      if (session.user.role === "SUPER_ADMIN") {
        // Super admin sees everything (all users, all statuses, public and private)
        // No filters applied
      } else if (showPrivate === "true") {
        // Show user's private resources
        where.userId = session.user.id;
        where.isPublic = false;
      } else {
        // Show public approved resources + user's own resources
        where.OR = [
          { isPublic: true, approvalStatus: "APPROVED" },
          { userId: session.user.id },
        ];
      }
    } else {
      // Guest users only see public approved resources
      where.isPublic = true;
      where.approvalStatus = "APPROVED";
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (isHot === "true") {
      where.isHot = true;
    }

    if (isTrending === "true") {
      where.isTrending = true;
    }

    const resources = await prisma.resource.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
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
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    // Transform the response to match the expected format
    const transformedResources = resources.map((resource) => ({
      ...resource,
      tags: resource.tags.map((rt) => rt.tag),
    }));

    return NextResponse.json(transformedResources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, description, thumbnail, categoryId, tagIds, isPublic = true } = body;

    // Validate required fields
    if (!title || !url || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, URL, description, and category are required" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existingResource = await prisma.resource.findFirst({
      where: {
        OR: [
          { title, userId: session.user.id },
          { url, userId: session.user.id },
        ],
      },
    });

    if (existingResource) {
      return NextResponse.json(
        { error: "A resource with this title or URL already exists" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Determine approval status
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const approvalStatus = isPublic && !isSuperAdmin ? "PENDING" : "APPROVED";

    const resource = await prisma.resource.create({
      data: {
        title,
        url,
        description,
        thumbnail: thumbnail || null,
        categoryId,
        userId: session.user.id,
        isPublic,
        approvalStatus,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create tag associations separately to avoid duplicates
    if (tagIds?.length) {
      await prisma.resourceTag.createMany({
        data: tagIds.map((tagId: string) => ({
          resourceId: resource.id,
          tagId: tagId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
