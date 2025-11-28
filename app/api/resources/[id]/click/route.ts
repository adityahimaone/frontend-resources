import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/resources/[id]/click - Increment click count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ clickCount: resource.clickCount });
  } catch (error) {
    console.error("Error incrementing click count:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
