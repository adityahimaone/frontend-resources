// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryClient from "./category-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// This function runs at build time to generate all possible category paths
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: {
      isPublic: true,
      approvalStatus: "APPROVED",
    },
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// This is a server component that fetches the initial data
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    // Fetch the category data - use findFirst since slug is no longer unique
    const category = await prisma.category.findFirst({
      where: {
        slug,
        isPublic: true,
        approvalStatus: "APPROVED",
      },
    });

    if (!category) {
      return notFound();
    }

    return <CategoryClient initialCategory={category} />;
  } catch (error) {
    console.error("Error fetching category:", error);
    return notFound();
  }
}
