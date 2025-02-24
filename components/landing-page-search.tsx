// components/search/SimpleSearch.tsx
"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  type: "category" | "resource";
}

export function LandingPageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
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

      const categories =
        categoriesData?.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          type: "category" as const,
        })) || [];

      const resources =
        resourcesData?.map((resource) => ({
          id: resource.id,
          title: resource.title,
          url: resource.url,
          type: "resource" as const,
        })) || [];

      setResults([...categories, ...resources]);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query) {
        searchData(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, searchData]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto relative" ref={searchRef}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search resources and categories..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <AnimatePresence>
            {isOpen && (query || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found
                  </div>
                ) : (
                  <div className="p-2">
                    {/* Categories */}
                    {results.some((r) => r.type === "category") && (
                      <div className="mb-4">
                        <div className="px-2 py-1 text-sm font-semibold text-gray-500">
                          Categories
                        </div>
                        {results
                          .filter((r) => r.type === "category")
                          .map((result) => (
                            <Link
                              key={result.id}
                              href={`/categories/${result.slug}`}
                              className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="flex items-center justify-between">
                                <span>{result.name}</span>
                                <Badge variant="secondary">Category</Badge>
                              </div>
                            </Link>
                          ))}
                      </div>
                    )}

                    {/* Resources */}
                    {results.some((r) => r.type === "resource") && (
                      <div>
                        <div className="px-2 py-1 text-sm font-semibold text-gray-500">
                          Resources
                        </div>
                        {results
                          .filter((r) => r.type === "resource")
                          .map((result) => (
                            <a
                              key={result.id}
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="flex items-center justify-between">
                                <span>{result.title}</span>
                                <Badge variant="outline">Resource</Badge>
                              </div>
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
