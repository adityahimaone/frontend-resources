"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/ui/resources-card";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail?: string | null;
  category: {
    id: string;
    name: string;
  };
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  isPublic?: boolean;
  isHot?: boolean;
  isTrending?: boolean;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status, router]);

  async function fetchBookmarks() {
    try {
      const response = await fetch("/api/bookmarks");
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }

  const trackClick = async (resourceId: string) => {
    try {
      await fetch(`/api/resources/${resourceId}/click`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center shadow-neo">
              <Bookmark className="w-6 h-6 text-black fill-black" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              My Bookmarks
            </h1>
          </div>
          <p className="text-xl font-medium text-muted-foreground border-l-4 border-black pl-4">
            Your saved resources for quick access
          </p>
        </motion.div>
      </div>

      {/* Bookmarks Grid */}
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.1, 1) }}
            >
              <ResourceCard
                id={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
                thumbnail={resource.thumbnail}
                link={resource.url}
                isExternal
                tags={resource.tags}
                isPublic={resource.isPublic}
                isHot={resource.isHot}
                isTrending={resource.isTrending}
                isBookmarked={true}
                onResourceClick={() => trackClick(resource.id)}
                onBookmarkChange={fetchBookmarks}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 border-2 border-black flex items-center justify-center">
            <Bookmark className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground mb-6">
            Start bookmarking resources to save them for later
          </p>
          <Button
            asChild
            className="bg-blue-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Link href="/resources">Browse Resources</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
