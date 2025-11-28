// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryClient from "./category-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// This function runs at build time to generate all possible category paths
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
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
    // Fetch the category data
    const category = await prisma.category.findUnique({
      where: { slug },
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
