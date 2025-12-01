"use client";

import {
  ArrowRight,
  ExternalLink,
  Globe,
  Lock,
  Flame,
  TrendingUp,
  Clock,
  XCircle,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface ResourceCardProps {
  id?: string;
  title: string;
  description: string;
  url?: string;
  thumbnail?: string | null;
  icon?: React.ElementType;
  iconColor?: string;
  link?: string;
  isExternal?: boolean;
  tags?: Tag[];
  className?: string;
  isPublic?: boolean;
  isHot?: boolean;
  isTrending?: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  isBookmarked?: boolean;
  onResourceClick?: () => void;
  onBookmarkChange?: () => void;
}

export function ResourceCard({
  id,
  title,
  description,
  url,
  thumbnail,
  icon: Icon,
  iconColor,
  link,
  isExternal = false,
  tags,
  className,
  isPublic = true,
  isHot = false,
  isTrending = false,
  approvalStatus = "APPROVED",
  isBookmarked: initialIsBookmarked = false,
  onResourceClick,
  onBookmarkChange,
}: ResourceCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleClick = () => {
    if (onResourceClick) {
      onResourceClick();
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark resources",
        variant: "destructive",
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Resource ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsBookmarking(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resourceId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle bookmark");
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);

      toast({
        title: data.bookmarked ? "Bookmarked" : "Removed from bookmarks",
        description: data.bookmarked
          ? "Resource added to your bookmarks"
          : "Resource removed from your bookmarks",
      });

      if (onBookmarkChange) {
        onBookmarkChange();
      }
    } catch (error: any) {
      console.error("Bookmark error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const showStatusBadge =
    approvalStatus === "PENDING" || approvalStatus === "REJECTED";

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (link) {
      if (isExternal) {
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
            onClick={handleClick}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={link} className="block h-full" onClick={handleClick}>
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card
        className={`h-full border-2 border-black shadow-neo hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all group ${className}`}
      >
        <CardHeader className="relative">
          {/* Status Badge for Pending/Rejected */}
          {showStatusBadge && (
            <div className="absolute -top-3 -left-3 z-10">
              {approvalStatus === "PENDING" && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black text-xs font-black border-2 border-black shadow-neo-sm">
                  <Clock className="w-3 h-3" />
                  PENDING
                </span>
              )}
              {approvalStatus === "REJECTED" && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-black border-2 border-black shadow-neo-sm">
                  <XCircle className="w-3 h-3" />
                  REJECTED
                </span>
              )}
            </div>
          )}

          {/* Hot/Trending Labels */}
          <div className="absolute -top-3 -right-3 flex gap-1 z-10">
            {isHot && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-black border-2 border-black shadow-neo-sm">
                <Flame className="w-3 h-3" />
                HOT
              </span>
            )}
            {isTrending && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-black border-2 border-black shadow-neo-sm">
                <TrendingUp className="w-3 h-3" />
                TRENDING
              </span>
            )}
          </div>

          {/* Thumbnail - Always show to maintain consistent height */}
          <div className="w-full h-40 mb-4 border-2 border-black overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Show placeholder on error
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    e.currentTarget.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className =
                      "w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300";
                    placeholder.innerHTML = `<div class="text-center"><svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-xs font-bold text-gray-500">No Image</p></div>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="text-center">
                  {Icon ? (
                    <div
                      className={`w-16 h-16 rounded-lg border-2 border-black ${iconColor} flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs font-bold text-gray-500">
                        No Image
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <CardTitle className="flex items-center justify-between font-black text-xl gap-2">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="truncate">{title}</span>
              {/* Visibility Icon */}
              {isPublic ? (
                <Globe
                  className="w-4 h-4 text-green-600 shrink-0"
                  aria-label="Public"
                />
              ) : (
                <Lock
                  className="w-4 h-4 text-amber-600 shrink-0"
                  aria-label="Private"
                />
              )}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {/* Bookmark Button */}
              {session && id && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-yellow-400 hover:border-2 hover:border-black transition-all"
                  onClick={handleBookmark}
                  disabled={isBookmarking}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </Button>
              )}
              {link &&
                (isExternal ? (
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                ))}
            </div>
          </CardTitle>

          {/* URL Display */}
          {url && (
            <div className="text-xs text-muted-foreground truncate font-mono mt-1">
              {url}
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={cn(
                    "border-2 border-black text-xs font-bold",
                    tag.color
                  )}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <CardDescription className="font-medium line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </CardWrapper>
  );
}
