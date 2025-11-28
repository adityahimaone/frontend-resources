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
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface ResourceCardProps {
  title: string;
  description: string;
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
  onResourceClick?: () => void;
}

export function ResourceCard({
  title,
  description,
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
  onResourceClick,
}: ResourceCardProps) {
  const handleClick = () => {
    if (onResourceClick) {
      onResourceClick();
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
            <div className="absolute -top-3 -left-3">
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
          <div className="absolute -top-3 -right-3 flex gap-1">
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

          {Icon && (
            <div
              className={`w-14 h-14 rounded-lg border-2 border-black ${iconColor} flex items-center justify-center mb-4`}
            >
              <Icon className="w-7 h-7" />
            </div>
          )}
          <CardTitle className="flex items-center justify-between font-black text-xl">
            <span className="flex items-center gap-2">
              {title}
              {/* Visibility Icon */}
              {isPublic ? (
                <Globe className="w-4 h-4 text-green-600" aria-label="Public" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600" aria-label="Private" />
              )}
            </span>
            {link &&
              (isExternal ? (
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              ))}
          </CardTitle>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="border-2 border-black text-xs font-bold"
                  style={{ backgroundColor: tag.color || undefined }}
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
