import prisma from "@/lib/prisma";
import EditResourceClient from "./EditResourceClient";

export async function generateStaticParams() {
  try {
    const resources = await prisma.resource.findMany({
      select: { id: true },
    });

    return resources.map((resource) => ({
      id: resource.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditResourceClient id={id} />;
}
