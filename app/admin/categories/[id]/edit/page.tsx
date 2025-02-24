// filepath: /c:/Development/Next/next-frontend-resources/app/admin/categories/[id]/edit/page.tsx
import { supabase } from "@/lib/supabase";
import EditCategoryClient from "./EditCategoryClient";

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

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditCategoryClient id={params.id} />;
}
