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
    <div className="max-w-2xl mx-auto relative z-50" ref={searchRef}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative z-50">
          <div className="relative z-50">
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
              className="w-full px-5 py-3.5 rounded-xl border-2 border-black focus:outline-none focus:ring-0 
              shadow-neo focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all bg-white text-black pl-12 font-medium"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
          </div>

          <AnimatePresence>
            {isOpen && (query || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute w-full mt-2 bg-white rounded-xl shadow-neo border-2 border-black 
                overflow-hidden z-[100]"
              >
                {isLoading ? (
                  <div className="p-6 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-black" />
                      <span className="text-black font-medium text-sm">
                        Searching...
                      </span>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border-2 border-black mb-3">
                      <Search className="h-6 w-6 text-black" />
                    </div>
                    <p className="text-black font-medium">
                      No results found for &quot;
                      <span className="font-bold">{query}</span>&quot;
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* Categories */}
                    {results.some((r) => r.type === "category") && (
                      <div className="border-b-2 border-black relative">
                        <div className="flex items-center px-4 py-2 text-xs font-black text-black bg-gray-100 border-b-2 border-black">
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
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group border-b border-black last:border-0"
                                >
                                  <div className="flex items-center">
                                    <span className="font-bold text-black">
                                      {result.name}
                                    </span>
                                  </div>
                                  <Badge className="bg-black text-white text-xs font-bold">
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
                      <div className="border-b-2 border-black">
                        <div className="flex items-center px-4 py-2 text-xs font-black text-black bg-gray-100 border-b-2 border-black">
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
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group border-b border-black last:border-0"
                                >
                                  <div className="flex items-center">
                                    <span className="font-bold text-black">
                                      {result.name}
                                    </span>
                                  </div>
                                  <Badge className="bg-white text-black border-black">
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
                        <div className="flex items-center px-4 py-2 text-xs font-black text-black bg-gray-100 border-b-2 border-black">
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
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group border-b border-black last:border-0"
                                >
                                  <div className="flex items-center">
                                    <span className="font-bold text-black">
                                      {result.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-bold"
                                    >
                                      Resource
                                    </Badge>
                                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
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
