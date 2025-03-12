import { useState } from "react";
import { Tag as TagIcon, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TagOption {
  id: string;
  name: string;
  color: string;
}

interface TagFilterProps {
  tags: TagOption[];
  selectedTags: TagOption[];
  onChange: (selectedTags: TagOption[]) => void;
  hiddenSelectedTags?: boolean;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onChange,
  hiddenSelectedTags = true,
  className,
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = searchQuery.trim()
    ? tags?.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : tags || [];

  const handleSelectTag = (tag: TagOption) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    } else {
      onChange(selectedTags.filter((t) => t.id !== tag.id));
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const clearAllTags = () => onChange([]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between min-w-[180px] h-10 px-3"
          >
            <div className="flex items-center gap-1">
              <TagIcon className="h-4 w-4 mr-1" />
              <span>
                {selectedTags?.length > 0
                  ? `${selectedTags.length} tag${
                      selectedTags.length > 1 ? "s" : ""
                    } selected`
                  : "Filter by tags"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3">
          <div className="space-y-2">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted",
                      selectedTags?.some((t) => t.id === tag.id)
                        ? "bg-muted/50"
                        : ""
                    )}
                    onClick={() => handleSelectTag(tag)}
                  >
                    <Badge className={cn("mr-2", tag.color)}>{tag.name}</Badge>
                    {selectedTags?.some((t) => t.id === tag.id) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  No tags found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Tags */}
      {selectedTags?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("flex flex-wrap gap-1", hiddenSelectedTags && "hidden")}
        >
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              className={cn("flex items-center gap-1 pl-3 pr-2", tag.color)}
            >
              {tag.name}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleRemoveTag(tag.id)}
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
  );
}
