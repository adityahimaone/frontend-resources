"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  type: "category" | "resource";
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search data
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .ilike("name", `%${query}%`)
          .limit(5);

        const { data: resourcesData, error: resourcesError } = await supabase
          .from("resources")
          .select("id, title, url")
          .ilike("title", `%${query}%`)
          .limit(5);

        if (categoriesError) throw categoriesError;
        if (resourcesError) throw resourcesError;

        const categories =
          categoriesData?.map((category) => ({
            ...category,
            type: "category" as const,
          })) || [];

        const resources =
          resourcesData?.map((resource) => ({
            ...resource,
            type: "resource" as const,
          })) || [];

        setResults([...categories, ...resources]);
      } catch (error) {
        console.error("Error searching:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative " ref={searchRef}>
      <motion.div
        initial={false}
        animate={{ width: isOpen ? "300px" : "40px" }}
        transition={{ duration: 0.2 }}
        className="relative "
      >
        <Button
          variant="ghost"
          size="icon"
          className={`absolute left-0 -top-5 ${
            isOpen ? "pointer-events-none top-0" : ""
          }`}
          onClick={() => setIsOpen(true)}
        >
          <SearchIcon className="h-5 w-5" />
        </Button>

        <div className={`${isOpen ? "block" : "hidden"}`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search categories and resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-transparent text-sm ring-offset-background 
              placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <AnimatePresence>
          {isOpen && (query || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground 
                shadow-lg rounded-lg overflow-hidden z-50 border border-border text-xs"
            >
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No results found
                </div>
              ) : (
                <div className="py-2">
                  {/* Categories Section */}
                  {results.some((r) => r.type === "category") && (
                    <div className="pb-2">
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        Categories
                      </div>
                      {results
                        .filter((r) => r.type === "category")
                        .map((result) => (
                          <Link
                            key={result.id}
                            href={`/categories/${result.slug}`}
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                            className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex items-center justify-between">
                              <span>{result.name}</span>
                              <Badge variant="secondary">Category</Badge>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}

                  {/* Resources Section */}
                  {results.some((r) => r.type === "resource") && (
                    <div>
                      {results.some((r) => r.type === "category") && (
                        <div className="border-t border-border my-2" />
                      )}
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                            className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground"
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
      </motion.div>
    </div>
  );
}
