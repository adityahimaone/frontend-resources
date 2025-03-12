"use client";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  color?: string;
  type: "category" | "resource" | "tag";
}

export function CommandSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [categoriesResponse, resourcesResponse, tagsResponse] =
        await Promise.all([
          supabase
            .from("categories")
            .select("id, name, slug")
            .ilike("name", `%${searchQuery}%`)
            .limit(5),
          supabase
            .from("resources")
            .select("id, title, url")
            .ilike("title", `%${searchQuery}%`)
            .limit(5),
          supabase
            .from("tags")
            .select("id, name, color")
            .ilike("name", `%${searchQuery}%`)
            .limit(5),
        ]);

      if (categoriesResponse.error) throw categoriesResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;
      if (tagsResponse.error) throw tagsResponse.error;

      const categories = (categoriesResponse.data || []).map((category) => ({
        ...category,
        type: "category" as const,
      }));

      const resources = (resourcesResponse.data || []).map((resource) => ({
        ...resource,
        type: "resource" as const,
      }));

      const tags = (tagsResponse.data || []).map((tag) => ({
        ...tag,
        type: "tag" as const,
      }));

      setResults([...categories, ...resources, ...tags]);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (isOpen) {
        searchData(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, isOpen, searchData]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setQuery("");
      setResults([]);
    }, 200);
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search resources, categories, and tags..."
            value={query}
            onValueChange={handleInputChange}
            onFocus={handleFocus}
            className="border-0 focus:ring-0 w-full"
            onMouseLeave={handleBlur}
            onBlur={handleBlur}
          />
          {isOpen && (
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Searching...</CommandEmpty>
              ) : (
                <>
                  {!query.trim() ? (
                    <CommandEmpty>Start typing to search...</CommandEmpty>
                  ) : results.length === 0 ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                  ) : (
                    <div className="px-4 py-2 text-sm">
                      {results.some((r) => r.type === "category") && (
                        <div className="flex flex-col gap-1">
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            Categories
                          </div>
                          {results
                            .filter((r) => r.type === "category")
                            .map((result) => (
                              <div
                                key={result.id}
                                className="flex w-full hover:bg-slate-100 px-2 py-1 rounded-lg"
                              >
                                <Link
                                  href={`/categories/${result.slug}`}
                                  className="flex items-center justify-between w-full"
                                >
                                  <span>{result.name}</span>
                                  <Badge variant="secondary">Category</Badge>
                                </Link>
                              </div>
                            ))}
                        </div>
                      )}

                      {results.some((r) => r.type === "tag") && (
                        <>
                          <div className="border-t border-slate-200 my-2" />
                          <div className="flex flex-col gap-1">
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Tags
                            </div>
                            {results
                              .filter((r) => r.type === "tag")
                              .map((result) => (
                                <div
                                  key={result.id}
                                  className="flex w-full hover:bg-slate-100 px-2 py-1 rounded-lg"
                                >
                                  <Link
                                    href={`/resources?tag=${result.id}`}
                                    className="flex items-center justify-between w-full"
                                  >
                                    <span>{result.name}</span>
                                    <Badge className={result.color}>
                                      {result.name}
                                    </Badge>
                                  </Link>
                                </div>
                              ))}
                          </div>
                        </>
                      )}

                      {results.some((r) => r.type === "resource") && (
                        <>
                          <div className="border-t border-slate-200 my-2" />
                          <div className="flex flex-col gap-1">
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Resources
                            </div>
                            {results
                              .filter((r) => r.type === "resource")
                              .map((result) => (
                                <div
                                  key={result.id}
                                  className="flex w-full hover:bg-slate-100 px-2 py-1 rounded-lg"
                                >
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between w-full"
                                  >
                                    <span>{result.title}</span>
                                    <Badge variant="outline">Resource</Badge>
                                  </a>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </CommandList>
          )}
        </Command>
      </motion.div>
    </div>
  );
}
