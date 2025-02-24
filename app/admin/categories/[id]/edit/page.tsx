import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { supabase } from "@/lib/supabase";
import EditCategoryClient from "./EditCategoryClient";
import { Suspense } from "react";
import Loading from "./Loading";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
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
  return (
    <Suspense fallback={<Loading />}>
      <EditCategoryClient id={params.id} />
    </Suspense>
  );
}
