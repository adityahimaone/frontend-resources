"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Folder, Tag, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`
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
    if (!query) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(() => searchData(query), 300);
    return () => clearTimeout(debounce);
  }, [query, searchData]);

  const categories = results.filter((r) => r.type === "category");
  const resources = results.filter((r) => r.type === "resource");
  const tags = results.filter((r) => r.type === "tag");

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    setQuery("");

    if (result.type === "category") {
      router.push(`/categories/${result.slug}`);
    } else if (result.type === "tag") {
      router.push(`/resources?tag=${result.id}`);
    } else if (result.type === "resource" && result.url) {
      window.open(result.url, "_blank");
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) setQuery("");
      }}
      title="Command Search"
      description="Search for categories, resources, and tags"
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search categories, resources, tags..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="py-6 text-center text-sm">Searching...</div>
        ) : results.length === 0 && query ? (
          <div className="py-6 text-center text-sm">
            No results found for &quot;{query}&quot;
          </div>
        ) : !query ? (
          <div className="py-6 text-center text-sm">
            Start typing to search...
          </div>
        ) : null}

        {!isLoading && results.length > 0 && (
          <>
            {categories.length > 0 && (
              <CommandGroup heading="Categories">
                {categories.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`${result.name}-${result.id}`}
                    keywords={[result.name || ""]}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <Folder className="mr-2 h-4 w-4 text-pink-600" />
                    <span className="flex-1">{result.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Category
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {tags.length > 0 && (
              <>
                {categories.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Tags">
                  {tags.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.name}-${result.id}`}
                      keywords={[result.name || ""]}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      <Tag className="mr-2 h-4 w-4 text-purple-600" />
                      <span className="flex-1">{result.name}</span>
                      <Badge className={cn("text-xs", result.color)}>
                        {result.name}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {resources.length > 0 && (
              <>
                {(categories.length > 0 || tags.length > 0) && (
                  <CommandSeparator />
                )}
                <CommandGroup heading="Resources">
                  {resources.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title}-${result.id}`}
                      keywords={[result.title || ""]}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="flex-1">{result.title}</span>
                      <Badge variant="outline" className="text-xs">
                        Resource
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
