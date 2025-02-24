"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Compass,
  ExternalLink,
  Layers,
  Notebook,
  Palette,
  Search,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CommandSearch } from "@/components/command-search";
import { LandingPageSearch } from "@/components/landing-page-search";
import RotatingText from "@/components/animation/RotatingText";
import Iridescence from "@/components/animation/IridescenceBackground";
import Aurora from "@/components/animation/AuroraBackground";
import Squares from "@/components/animation/SquaresBackground";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  url?: string;
  type: "category" | "resource";
}

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: {
    name: string;
  };
  created_at: string;
}

const categories = [
  {
    title: "UI Components",
    description:
      "Explore modern UI component libraries like shadcn/ui and Flowbite",
    icon: Layers,
    href: "/categories/ui-components",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Animation Libraries",
    description:
      "Discover powerful animation tools like Framer Motion and GSAP",
    icon: Zap,
    href: "/categories/animation-libraries",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "UI Animation Components",
    description:
      "Find ready-to-use animated components from ReactBits and Aceternity UI",
    icon: Code2,
    href: "/categories/ui-animation-components",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Design Inspiration",
    description: "Get inspired by award-winning websites and designs",
    icon: Palette,
    href: "/categories/inspiration",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Frameworks",
    description:
      "Learn about Next.js, Astro, Remix, and other modern frameworks",
    icon: Compass,
    href: "/categories/frameworks",
    color: "bg-red-500/10 text-red-500",
  },
  // Others
  {
    title: "Others",
    description: "Discover other useful frontend resources",
    icon: Notebook,
    href: "/categories/other-tools",
    color: "bg-pink-500/10 text-pink-500",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetchRecentResources();
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      try {
        const [categoriesResponse, resourcesResponse] = await Promise.all([
          supabase
            .from("categories")
            .select("id, name, slug")
            .ilike("name", `%${query}%`)
            .limit(5),
          supabase
            .from("resources")
            .select("id, title, url")
            .ilike("title", `%${query}%`)
            .limit(5),
        ]);

        const categories = (categoriesResponse.data || []).map((category) => ({
          ...category,
          type: "category" as const,
        }));

        const resources = (resourcesResponse.data || []).map((resource) => ({
          ...resource,
          type: "resource" as const,
        }));

        setResults([...categories, ...resources]);
      } catch (error) {
        console.error("Error searching:", error);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const fetchRecentResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRecentResources(data);
      }
    } catch (error) {
      console.error("Error fetching recent resources:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary">
      <div className="h-full">
        {/* <Aurora
          colorStops={["#38bdf8", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"]}
          blend={0.5}
          amplitude={2.0}
          speed={0.5}
        /> */}
      </div>
      <div className="">
        <div id="hero" className="relative">
          <div className="absolute inset-0 z-0">
            <Squares speed={0.5} squareSize={40} direction="diagonal" />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 relative"
            >
              <div className="flex text-4xl md:text-6xl items-center justify-center mb-6 gap-2">
                <h1 className="font-bold bg-clip-text text-transparent bg-linear-to-r from-[#38bdf8] to-[#3b82f6]">
                  Frontend
                </h1>
                <RotatingText
                  texts={["Resources", "Tools", "Inspiration"]}
                  mainClassName="px-2 sm:px-2 bg-[#3b82f6] md:px-3 font-medium text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A curated collection of the best frontend development tools,
                libraries, and inspiration sources to supercharge your web
                development workflow.
              </p>
              {/* Search Component */}
              <div className="mt-2">
                <LandingPageSearch />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-24">
          {/* Cetegories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}
                      >
                        <category.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {category.title}
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-16 text-center"
          >
            <Button asChild size="lg">
              <Link href="/categories">
                Browse All Resources
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
          {/* Recent Add */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Recently Added Resources</h2>
              <Button asChild variant="outline">
                <Link href="/resources">
                  View All Resources
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{resource.title}</span>
                        <Link
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        <div className="mb-2">
                          <Badge variant="secondary">
                            {resource.category.name}
                          </Badge>
                        </div>
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
