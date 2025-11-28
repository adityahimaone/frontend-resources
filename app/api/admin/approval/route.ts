import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import { ApprovalStatus } from "@prisma/client";

// POST /api/admin/approval - Approve or reject content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, status } = body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED, REJECTED, or PENDING" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "resource":
        result = await prisma.resource.update({
          where: { id },
          data: { approvalStatus: status as ApprovalStatus },
        });
        break;
      case "category":
        result = await prisma.category.update({
          where: { id },
          data: { approvalStatus: status as ApprovalStatus },
        });
        break;
      case "tag":
        result = await prisma.tag.update({
          where: { id },
          data: { approvalStatus: status as ApprovalStatus },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type. Must be resource, category, or tag" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    return NextResponse.json(
      { error: "Failed to update approval status" },
      { status: 500 }
    );
  }
}

// GET /api/admin/approval - Get pending items for approval
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const statusFilter = (searchParams.get("status") || "PENDING") as ApprovalStatus;

    const filter = {
      isPublic: true,
      approvalStatus: statusFilter,
    };

    const result: any = {};

    if (!type || type === "resources") {
      result.resources = await prisma.resource.findMany({
        where: filter,
        include: {
          category: true,
          tags: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!type || type === "categories") {
      result.categories = await prisma.category.findMany({
        where: filter,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!type || type === "tags") {
      result.tags = await prisma.tag.findMany({
        where: filter,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pending items:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending items" },
      { status: 500 }
    );
  }
}
