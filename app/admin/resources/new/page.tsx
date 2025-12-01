"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Lock, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect, Option } from "@/components/ui/multi-select";

interface Category {
  id: string;
  name: string;
}

const TAG_COLORS = [
  "bg-blue-500/10 text-blue-500",
  "bg-green-500/10 text-green-500",
  "bg-red-500/10 text-red-500",
  "bg-yellow-500/10 text-yellow-500",
  "bg-purple-500/10 text-purple-500",
  "bg-pink-500/10 text-pink-500",
  "bg-indigo-500/10 text-indigo-500",
  "bg-orange-500/10 text-orange-500",
  "bg-teal-500/10 text-teal-500",
  "bg-cyan-500/10 text-cyan-500",
];

export default function NewResourcePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch(
        "/api/categories?sortField=name&sortOrder=asc"
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  }

  async function fetchTags() {
    try {
      const response = await fetch("/api/tags?sortField=name&sortOrder=asc");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();

      console.log("Fetched tags:", data);
      setTags(
        data.map((tag: any) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color,
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    }
  }

  async function createNewTag(name: string) {
    try {
      const randomColor =
        TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color: randomColor,
          isPublic: false, // Create as private so general users can use immediately
        }),
      });

      if (!response.ok) throw new Error("Failed to create tag");
      const data = await response.json();

      const newTag = {
        value: data.id,
        label: data.name,
        color: data.color,
      };
      setTags([...tags, newTag]);
      setSelectedTags([...selectedTags, newTag]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  }

  async function handleAutoFill() {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL first",
        variant: "destructive",
      });
      return;
    }

    setScraping(true);
    try {
      const response = await fetch("/api/scrape-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Failed to scrape URL");

      const data = await response.json();

      if (data.title && !title) {
        setTitle(data.title);
      }
      if (data.description && !description) {
        setDescription(data.description);
      }
      if (data.thumbnail) {
        setThumbnail(data.thumbnail);
      }

      toast({
        title: "Success",
        description: "Metadata fetched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch metadata from URL",
        variant: "destructive",
      });
    } finally {
      setScraping(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        url,
        description,
        thumbnail: thumbnail || null,
        categoryId,
        tagIds: selectedTags.map((tag) => tag.value),
        isPublic,
      };

      console.log("Creating resource with payload:", payload);

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API error response:", error);
        throw new Error(error.error || "Failed to create resource");
      }

      const data = await response.json();
      console.log("Resource created successfully:", data);

      toast({
        title: "Success",
        description:
          isPublic && !isSuperAdmin
            ? "Resource created and pending approval"
            : "Resource created successfully",
      });

      router.push("/admin/resources");
    } catch (error: any) {
      console.error("Error creating resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black mb-4">New Resource</h1>
          <p className="text-xl text-muted-foreground">
            Add a new resource to the collection
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-black shadow-neo">
          <CardHeader className="border-b-2 border-black bg-green-100">
            <CardTitle className="font-black">Resource Details</CardTitle>
            <CardDescription className="font-medium">
              Enter the details for the new resource
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="font-bold">
                  URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={scraping || !url}
                    className="bg-purple-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    {scraping ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto-fill
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click Auto-fill to fetch title, description, and thumbnail
                  from the URL
                </p>
              </div>

              {/* Thumbnail Preview */}
              {thumbnail && (
                <div className="space-y-2">
                  <Label className="font-bold">Thumbnail Preview</Label>
                  <div className="w-full h-48 border-2 border-black overflow-hidden bg-gray-100">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setThumbnail("");
                        toast({
                          title: "Invalid thumbnail",
                          description: "Failed to load thumbnail image",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setThumbnail("")}
                    className="w-full"
                  >
                    Remove Thumbnail
                  </Button>
                </div>
              )}

              {/* Manual Thumbnail Input */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="font-bold">
                  Thumbnail URL (Optional)
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty or use Auto-fill to fetch from URL metadata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-bold">
                  Category
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Tags</Label>
                <MultiSelect
                  options={tags}
                  selected={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select or create tags..."
                  createOption={createNewTag}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              {/* Visibility Switch */}
              <div className="flex items-center justify-between p-4 border-2 border-black bg-gray-50">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <Label
                      htmlFor="visibility"
                      className="font-bold cursor-pointer"
                    >
                      {isPublic ? "Public" : "Private"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublic
                        ? isSuperAdmin
                          ? "Visible to everyone immediately"
                          : "Will be visible after approval"
                        : "Only visible to you"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="visibility"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Resource"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
