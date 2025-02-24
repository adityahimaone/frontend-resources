import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import EditCategoryClient from "./EditCategoryClient";
import { Suspense } from "react";
import Loading from "./Loading";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Edit Category ${params.id}`,
  };
}

export async function generateStaticParams() {
  try {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .throwOnError();

    if (!categories?.length) {
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

export default async function Page({ params }: Props) {
  if (!params.id) {
    throw new Error("Category ID is required");
  }

  return (
    <Suspense fallback={<Loading />}>
      <EditCategoryClient id={params.id} />
    </Suspense>
  );
}
