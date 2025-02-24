import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { supabase } from "@/lib/supabase";
import EditCategoryClient from "./EditCategoryClient";
import { Suspense } from "react";
import Loading from "./Loading";

// Define correct page params type for Next.js 13+
type PageParams = {
  id: string;
};

// Update PageProps interface
interface PageProps {
  params: PageParams;
  searchParams: { [key: string]: string | string[] | undefined };
}

// Add generateMetadata for better SEO (optional)
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Edit Category ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    const { data: categories } = await supabase.from("categories").select("id");

    if (!categories) {
      return [];
    }

    return categories.map((category) => ({
      id: category.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: PageProps) {
  if (!params.id) {
    throw new Error("Category ID is required");
  }

  return (
    <Suspense fallback={<Loading />}>
      <EditCategoryClient id={params.id} />
    </Suspense>
  );
}
