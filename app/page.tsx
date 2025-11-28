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
import { CommandSearch } from "@/components/command-search";
import { LandingPageSearch } from "@/components/landing-page-search";
import RotatingText from "@/components/animation/RotatingText";
import Iridescence from "@/components/animation/IridescenceBackground";
import Aurora from "@/components/animation/AuroraBackground";
import Squares from "@/components/animation/SquaresBackground";
import { ResourceCard } from "@/components/ui/resources-card";

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
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  createdAt: string;
}

const categories = [
  {
    title: "UI Components",
    description:
      "Explore modern UI component libraries like shadcn/ui and Flowbite",
    icon: Layers,
    href: "/categories/ui-components",
    color: "bg-blue-400",
  },
  {
    title: "Animation Libraries",
    description:
      "Discover powerful animation tools like Framer Motion and GSAP",
    icon: Zap,
    href: "/categories/animation-libraries",
    color: "bg-purple-400",
  },
  {
    title: "UI Animation Components",
    description:
      "Find ready-to-use animated components from ReactBits and Aceternity UI",
    icon: Code2,
    href: "/categories/ui-animation-components",
    color: "bg-green-400",
  },
  {
    title: "Design Inspiration",
    description: "Get inspired by award-winning websites and designs",
    icon: Palette,
    href: "/categories/inspiration",
    color: "bg-orange-400",
  },
  {
    title: "Frameworks",
    description:
      "Learn about Next.js, Astro, Remix, and other modern frameworks",
    icon: Compass,
    href: "/categories/frameworks",
    color: "bg-red-400",
  },
  // Others
  {
    title: "Others",
    description: "Discover other useful frontend resources",
    icon: Notebook,
    href: "/categories/other-tools",
    color: "bg-pink-400",
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
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=5`
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error searching:", error);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const fetchRecentResources = async () => {
    try {
      const response = await fetch(
        "/api/resources?sortField=createdAt&sortOrder=desc&limit=6"
      );
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      setRecentResources(data);
    } catch (error) {
      console.error("Error fetching recent resources:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="">
        <div
          id="hero"
          className="relative border-b-2 border-black bg-yellow-300 overflow-hidden"
        >
          <div className="absolute top-10 left-10 w-16 h-16 bg-pink-400 border-2 border-black shadow-neo rounded-full opacity-100 hidden md:block animate-bounce delay-700"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-400 border-2 border-black shadow-neo rotate-12 opacity-100 hidden md:block animate-pulse"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-green-400 border-2 border-black shadow-neo rotate-45 opacity-100 hidden md:block"></div>

          <div className="relative z-10 container h-full mx-auto px-4 pt-48 pb-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 relative"
            >
              <div className="flex flex-col md:flex-row text-4xl md:text-6xl items-center justify-center mb-6 gap-4 font-black uppercase tracking-tighter">
                <h1 className="text-black bg-white px-4 py-2 border-2 border-black shadow-neo transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  Frontend
                </h1>
                <RotatingText
                  texts={["Resources", "Tools", "Inspiration"]}
                  mainClassName="px-4 bg-pink-500 text-white py-2 justify-center border-2 border-black shadow-neo transform rotate-2 hover:rotate-0 transition-transform duration-300"
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
              <p className="text-xl font-bold max-w-2xl mx-auto mb-8 border-2 border-black p-4 bg-white shadow-neo relative z-20">
                A curated collection of the best frontend development tools,
                libraries, and inspiration sources to supercharge your web
                development workflow.
              </p>
              {/* Search Component */}
              <div className="mt-2 max-w-2xl mx-auto relative z-30">
                <LandingPageSearch />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-24">
          {/* Cetegories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card className="h-full cursor-pointer group hover:-translate-y-1 transition-transform duration-200 bg-white">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 border-2 border-black ${category.color} flex items-center justify-center mb-4 shadow-neo-sm`}
                      >
                        <category.icon className="w-6 h-6 text-black" />
                      </div>
                      <CardTitle className="flex items-center justify-between text-xl font-black uppercase">
                        {category.title}
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all text-black" />
                      </CardTitle>
                      <CardDescription className="text-black font-medium mt-2">
                        {category.description}
                      </CardDescription>
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
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 font-black uppercase tracking-wider"
            >
              <Link href="/categories">
                Browse All Resources
                <ArrowRight className="ml-2 w-6 h-6" />
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
            <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Recently Added Resources
              </h2>
              <Button asChild variant="outline" className="font-bold">
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
                  <ResourceCard
                    title={resource.title}
                    description={resource.description}
                    link={resource.url}
                    isExternal
                    tags={resource.tags}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
