"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { Search, Folder, Tag, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  color?: string;
  type: "category" | "resource" | "tag";
}

export function LandingPageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data);
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search resources, categories, and tags..."
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
              shadow-sm bg-white dark:bg-gray-800 dark:text-gray-100 text-gray-800 pl-12"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>

          <AnimatePresence>
            {isOpen && (query || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 
                overflow-hidden z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
              >
                {isLoading ? (
                  <div className="p-6 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Searching...
                      </span>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                      <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No results found for &quot;
                      <span className="font-medium">{query}</span>&quot;
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* Categories */}
                    {results.some((r) => r.type === "category") && (
                      <div className="border-b border-gray-100 dark:border-gray-700 relative">
                        <div className="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80">
                          <Folder className="h-3.5 w-3.5 mr-1.5" />
                          <span>CATEGORIES</span>
                        </div>
                        <div>
                          {results
                            .filter((r) => r.type === "category")
                            .map((result) => (
                              <Link
                                key={result.id}
                                href={`/categories/${result.slug}`}
                                onClick={() => setIsOpen(false)}
                              >
                                <motion.div
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.03)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between group"
                                >
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {result.name}
                                    </span>
                                  </div>
                                  <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                                    Category
                                  </Badge>
                                </motion.div>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {results.some((r) => r.type === "tag") && (
                      <div className="border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80">
                          <Tag className="h-3.5 w-3.5 mr-1.5" />
                          <span>TAGS</span>
                        </div>
                        <div>
                          {results
                            .filter((r) => r.type === "tag")
                            .map((result) => (
                              <Link
                                key={result.id}
                                href={`/resources?tag=${result.id}`}
                                onClick={() => setIsOpen(false)}
                              >
                                <motion.div
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.03)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between group"
                                >
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {result.name}
                                    </span>
                                  </div>
                                  <Badge
                                    className={
                                      result.color ||
                                      "bg-purple-100 text-purple-600"
                                    }
                                  >
                                    {result.name}
                                  </Badge>
                                </motion.div>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {results.some((r) => r.type === "resource") && (
                      <div>
                        <div className="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          <span>RESOURCES</span>
                        </div>
                        <div>
                          {results
                            .filter((r) => r.type === "resource")
                            .map((result) => (
                              <a
                                key={result.id}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                              >
                                <motion.div
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.03)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between group"
                                >
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {result.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-medium"
                                    >
                                      Resource
                                    </Badge>
                                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </motion.div>
                              </a>
                            ))}
                        </div>
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
