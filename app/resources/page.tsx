"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ExternalLink,
  Search,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/ui/resources-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { TagFilter } from "@/components/ui/tag-filter";
import { useSearchParams } from "next/navigation";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: {
    name: string;
  };
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface TagType {
  id: string;
  name: string;
  color: string;
}

type SortField = "title" | "createdAt";
type SortOrder = "asc" | "desc";

const RESOURCES_PER_PAGE = 9;

// Wrapper component that gets search params
function ResourcesPageContent() {
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tag");

  return <ResourcesPageImplementation initialTagId={tagId} />;
}

// Main component implementation
function ResourcesPageImplementation({
  initialTagId,
}: {
  initialTagId: string | null;
}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    // Only process if we have tags loaded and there's a tag parameter
    if (tags.length > 0 && initialTagId && initialLoad) {
      const foundTag = tags.find((tag) => tag.id === initialTagId);
      if (foundTag) {
        setSelectedTags([foundTag]);
      }
      setInitialLoad(false);
    }
  }, [tags, initialTagId, initialLoad]);

  useEffect(() => {
    setResources([]);
    setHasMore(true);
    fetchResources(0);
  }, [selectedCategory, selectedTags, sortField, sortOrder, searchQuery]);

  useEffect(() => {
    if (loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreResources();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadingMore, hasMore, resources.length]);

  async function fetchCategories() {
    try {
      const response = await fetch(
        "/api/categories?sortField=name&sortOrder=asc"
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function fetchTags() {
    try {
      const response = await fetch("/api/tags?sortField=name&sortOrder=asc");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }

  async function fetchResources(startIndex: number) {
    try {
      const params = new URLSearchParams({
        sortField,
        sortOrder,
        offset: String(startIndex),
        limit: String(RESOURCES_PER_PAGE),
      });

      if (selectedCategory !== "all") {
        params.set("categoryId", selectedCategory);
      }

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/resources?${params}`);
      if (!response.ok) throw new Error("Failed to fetch resources");
      let data = await response.json();

      // Filter by tags if any are selected
      if (selectedTags.length > 0) {
        data = data.filter((resource: Resource) => {
          const resourceTagIds = resource.tags?.map((t) => t.id) || [];
          return selectedTags.every((tag) => resourceTagIds.includes(tag.id));
        });
      }

      if (startIndex === 0) {
        setResources(data);
      } else {
        setResources((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === RESOURCES_PER_PAGE);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function fetchMoreResources() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchResources(resources.length);
  }

  const updateResourceUrl = (tag: TagType | null = null) => {
    // Create a URL object with the current location
    const url = new URL(window.location.href);

    if (tag) {
      // Add or update the tag parameter
      url.searchParams.set("tag", tag.id);
    } else {
      // If no tag provided, remove the parameter
      url.searchParams.delete("tag");
    }

    // Update browser history without refreshing the page
    window.history.pushState({}, "", url.toString());
  };

  const handleTagSelection = (tag: TagType) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      updateResourceUrl(tag); // Update URL when selecting tag
    }
    setTagSearchValue("");
  };

  const handleTagRemoval = (tagId: string) => {
    const newSelectedTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(newSelectedTags);

    if (newSelectedTags.length > 0) {
      updateResourceUrl(newSelectedTags[0]); // Keep the URL updated with first tag
    } else {
      updateResourceUrl(); // Clear tag from URL if no tags selected
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    updateResourceUrl(); // Clear tag from URL
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-4xl font-bold mb-4">All Resources</h1>
          <p className="text-xl text-muted-foreground">
            Browse through our complete collection of frontend development
            resources
          </p>
        </motion.div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4 lg:space-y-0">
        {/* Combined Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          {/* Search Box - Takes more space on desktop */}
          <div className="relative lg:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Filters Container */}
          <div className="flex flex-row gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[140px] min-w-[140px] lg:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />

            {/* Sort Controls */}
            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as SortField)}
            >
              <SelectTrigger className="w-[140px] min-w-[140px] lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="createdAt">Date Added</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Button
              variant="outline"
              size="icon"
              className="min-w-[40px]"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Selected Tags - Keep this section as it is */}
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                className={cn("flex items-center gap-1 pl-3 pr-2", tag.color)}
              >
                {tag.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleTagRemoval(tag.id)}
                />
              </Badge>
            ))}

            {selectedTags.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAllTags}
              >
                Clear all
              </Button>
            )}
          </motion.div>
        )}
      </div>
      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 1) }}
          >
            <ResourceCard
              title={resource.title}
              description={resource.description}
              link={resource.url}
              isExternal
              tags={resource.tags}
            />
          </motion.div>
        ))}
      </div>
      {/* Empty State */}
      {resources.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground text-lg">
            No resources found matching your search.
          </p>
          {(selectedTags.length > 0 ||
            selectedCategory !== "all" ||
            searchQuery) && (
            <Button variant="outline" onClick={clearAllTags} className="mt-4">
              Clear all filters
            </Button>
          )}
        </motion.div>
      )}
      {/* Loading More Indicator */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center items-center py-8 gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  );
}
