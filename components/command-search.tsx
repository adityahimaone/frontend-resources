// components/search/command-search.tsx
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
  type: "category" | "resource";
}

export function CommandSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Memoize the search function to prevent unnecessary recreations
  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Add error handling untuk responses
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .ilike("name", `%${searchQuery}%`)
        .limit(5);

      const { data: resourcesData, error: resourcesError } = await supabase
        .from("resources")
        .select("id, title, url")
        .ilike("title", `%${searchQuery}%`)
        .limit(5);

      if (categoriesError) throw categoriesError;
      if (resourcesError) throw resourcesError;

      // Make sure data exists before mapping
      const categories = categoriesData
        ? categoriesData.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            type: "category" as const,
          }))
        : [];

      const resources = resourcesData
        ? resourcesData.map((resource) => ({
            id: resource.id,
            title: resource.title,
            url: resource.url,
            type: "resource" as const,
          }))
        : [];

      setResults([...categories, ...resources]);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use useEffect with cleanup to handle debouncing
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
            placeholder="Search resources and categories..."
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
                          {results
                            .filter((r) => r.type === "category")
                            .map((result) => (
                              <div
                                key={result.id}
                                onSelect={() => {
                                  setIsOpen(false);
                                  setQuery("");
                                }}
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
                      <div className="border-t border-slate-200 my-2" />
                      {results.some((r) => r.type === "resource") && (
                        <div className="flex flex-col gap-1">
                          {results
                            .filter((r) => r.type === "resource")
                            .map((result) => (
                              <div
                                key={result.id}
                                onSelect={() => {
                                  setIsOpen(false);
                                  setQuery("");
                                }}
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
