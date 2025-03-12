"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Tag, Folder, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  color?: string;
  type: "category" | "resource" | "tag";
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search data with tags included
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
    if (!query) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(() => searchData(query), 300);
    return () => clearTimeout(debounce);
  }, [query, searchData]);

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

  // Group results by type
  const categories = results.filter((r) => r.type === "category");
  const resources = results.filter((r) => r.type === "resource");
  const tags = results.filter((r) => r.type === "tag");

  return (
    <div className="relative" ref={searchRef}>
      <motion.div
        initial={false}
        animate={{ width: isOpen ? "300px" : "40px" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative"
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
            placeholder="Search categories, resources, tags..."
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground 
                shadow-lg rounded-lg overflow-hidden z-50 border border-border"
            >
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.3, 1],
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
                </div>
              ) : results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-muted-foreground"
                >
                  No results found for &quot;{query}&quot;
                </motion.div>
              ) : (
                <div className="py-2 max-h-[60vh] overflow-y-auto">
                  {/* Categories Section */}
                  {categories.length > 0 && (
                    <div className="pb-2">
                      <div
                        className="px-4 py-2 text-xs font-medium text-muted-foreground flex items-center"
                        onClick={() =>
                          setActiveSection(
                            activeSection === "categories" ? null : "categories"
                          )
                        }
                      >
                        <Folder size={14} className="mr-1.5" />
                        Categories
                      </div>
                      <div>
                        {categories.map((result) => (
                          <Link
                            key={result.id}
                            href={`/categories/${result.slug}`}
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(var(--accent), 0.4)",
                              }}
                              className="px-4 py-2.5 hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                            >
                              <span className="font-medium">{result.name}</span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Category
                              </Badge>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Section */}
                  {tags.length > 0 && (
                    <div className="pb-2">
                      {categories.length > 0 && (
                        <div className="border-t border-border my-2" />
                      )}
                      <div
                        className="px-4 py-2 text-xs font-medium text-muted-foreground flex items-center"
                        onClick={() =>
                          setActiveSection(
                            activeSection === "tags" ? null : "tags"
                          )
                        }
                      >
                        <Tag size={14} className="mr-1.5" />
                        Tags
                      </div>
                      <div>
                        {tags.map((result) => (
                          <Link
                            key={result.id}
                            href={`/resources?tag=${result.id}`}
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(var(--accent), 0.4)",
                              }}
                              className="px-4 py-2.5 hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                            >
                              <span className="font-medium">{result.name}</span>
                              <Badge className={cn("ml-2", result.color)}>
                                {result.name}
                              </Badge>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources Section */}
                  {resources.length > 0 && (
                    <div>
                      {(categories.length > 0 || tags.length > 0) && (
                        <div className="border-t border-border my-2" />
                      )}
                      <div
                        className="px-4 py-2 text-xs font-medium text-muted-foreground flex items-center"
                        onClick={() =>
                          setActiveSection(
                            activeSection === "resources" ? null : "resources"
                          )
                        }
                      >
                        <ExternalLink size={14} className="mr-1.5" />
                        Resources
                      </div>
                      <div>
                        {resources.map((result) => (
                          <a
                            key={result.id}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setIsOpen(false);
                              setQuery("");
                            }}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(var(--accent), 0.4)",
                              }}
                              className="px-4 py-2.5 hover:bg-accent hover:text-accent-foreground flex items-center justify-between group"
                            >
                              <span className="font-medium">
                                {result.title}
                              </span>
                              <div className="flex items-center">
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Resource
                                </Badge>
                                <ExternalLink
                                  size={14}
                                  className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
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
      </motion.div>
    </div>
  );
}
