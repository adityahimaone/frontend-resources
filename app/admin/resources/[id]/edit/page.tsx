// filepath: /c:/Development/Next/next-frontend-resources/app/admin/resources/[id]/edit/page.tsx
import { supabase } from "@/lib/supabase";
import EditResourceClient from "./EditResourceClient";

export async function generateStaticParams() {
  try {
    const { data: resources } = await supabase.from("resources").select("id");

    if (!resources) {
      return [];
    }

    return resources.map((resource) => ({
      id: resource.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default function EditResourcePage({
  params,
}: {
  params: { id: string };
}) {
  return <EditResourceClient id={params.id} />;
}
