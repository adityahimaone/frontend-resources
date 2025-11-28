import { Metadata } from "next";
import prisma from "@/lib/prisma";
import EditCategoryClient from "./EditCategoryClient";
import { Suspense } from "react";
import Loading from "./Loading";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Category ${id}`,
  };
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true },
    });

    return categories.map((category) => ({
      id: category.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  if (!id) {
    throw new Error("Category ID is required");
  }

  return (
    <Suspense fallback={<Loading />}>
      <EditCategoryClient id={id} />
    </Suspense>
  );
}
