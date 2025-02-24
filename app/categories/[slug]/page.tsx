// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CategoryClient from "./category-client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// This function runs at build time to generate all possible category paths
export async function generateStaticParams() {
  const { data: categories } = await supabase.from("categories").select("slug");

  if (!categories) return [];

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Create a list of valid slugs
const getValidSlugs = async () => {
  const { data: categories } = await supabase.from("categories").select("slug");

  return categories?.map((category) => category.slug) || [];
};

// This is a server component that fetches the initial data
export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  // Get valid slugs
  const validSlugs = await getValidSlugs();

  // Check if the current slug is valid
  if (!validSlugs.includes(params.slug)) {
    notFound();
  }

  try {
    // Fetch the category data
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (error || !category) {
      return notFound();
    }

    return <CategoryClient initialCategory={category} />;
  } catch (error) {
    console.error("Error fetching category:", error);
    return notFound();
  }
}
