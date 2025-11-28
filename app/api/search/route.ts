import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/search - Search across categories, resources, and tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const [categories, resources, tags] = await Promise.all([
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        take: 5,
      }),
      prisma.resource.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
        },
        take: 5,
      }),
      prisma.tag.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        take: 5,
      }),
    ]);

    const results = [
      ...categories.map((c) => ({ ...c, type: "category" as const })),
      ...resources.map((r) => ({ ...r, type: "resource" as const })),
      ...tags.map((t) => ({ ...t, type: "tag" as const })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
