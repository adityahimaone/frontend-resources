import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";

// GET /api/resources/[id] - Get a single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedResource = {
      ...resource,
      tags: resource.tags.map((rt) => rt.tag),
    };

    return NextResponse.json(transformedResource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[id] - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, url, description, thumbnail, categoryId, tagIds, isPublic, isHot, isTrending } = body;

    // Check if user owns this resource or is super admin
    const existingResource = await prisma.resource.findUnique({
      where: { id },
      select: { userId: true },
    });

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isOwner = existingResource?.userId === session.user.id;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // First, delete existing tag associations
    await prisma.resourceTag.deleteMany({
      where: { resourceId: id },
    });

    // Build update data
    const updateData: any = {
      title,
      url,
      description,
      thumbnail,
      categoryId,
      tags: tagIds?.length
        ? {
            create: tagIds.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    };

    // Only allow super admin to update isHot and isTrending
    if (isSuperAdmin) {
      if (typeof isHot === "boolean") updateData.isHot = isHot;
      if (typeof isTrending === "boolean") updateData.isTrending = isTrending;
    }

    // Handle visibility change
    if (typeof isPublic === "boolean") {
      updateData.isPublic = isPublic;
      // If changing to public and not super admin, set to pending
      if (isPublic && !isSuperAdmin) {
        updateData.approvalStatus = "PENDING";
      }
    }

    // Then update the resource with new tag associations
    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
