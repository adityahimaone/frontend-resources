"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
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
}: ResourceCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (link) {
      if (isExternal) {
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={link} className="block h-full">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card
        className={`h-full hover:shadow-lg transition-shadow group ${className}`}
      >
        <CardHeader>
          {Icon && (
            <div
              className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center mb-4`}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
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
                  className={tag.color || "bg-primary/10 text-primary"}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </CardWrapper>
  );
}
