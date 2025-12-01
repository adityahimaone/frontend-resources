"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Lock,
  Flame,
  TrendingUp,
  Sparkles,
  Loader2,
} from "lucide-react";
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

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail?: string | null;
  categoryId: string;
  isPublic?: boolean;
  isHot?: boolean;
  isTrending?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
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

export default function EditResourceClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchResource();
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

  async function fetchResource() {
    try {
      const response = await fetch(`/api/resources/${id}`);
      if (!response.ok) throw new Error("Failed to fetch resource");
      const data = await response.json();

      setResource({
        id: data.id,
        title: data.title,
        url: data.url,
        description: data.description,
        thumbnail: data.thumbnail || null,
        categoryId: data.categoryId,
        isPublic: data.isPublic ?? true,
        isHot: data.isHot ?? false,
        isTrending: data.isTrending ?? false,
      });

      if (data.tags && Array.isArray(data.tags)) {
        const extractedTags = data.tags.map((tag: Tag) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color,
        }));
        setSelectedTags(extractedTags);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resource",
        variant: "destructive",
      });
      router.push("/admin/resources");
    } finally {
      setLoading(false);
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
    if (!resource?.url) {
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
        body: JSON.stringify({ url: resource.url }),
      });

      if (!response.ok) throw new Error("Failed to scrape URL");

      const data = await response.json();

      const updates: Partial<Resource> = {};
      if (data.title && !resource.title) {
        updates.title = data.title;
      }
      if (data.description && !resource.description) {
        updates.description = data.description;
      }
      if (data.thumbnail) {
        updates.thumbnail = data.thumbnail;
      }

      setResource({ ...resource, ...updates });

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
    if (!resource) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: resource.title,
          url: resource.url,
          description: resource.description,
          thumbnail: resource.thumbnail,
          categoryId: resource.categoryId,
          tagIds: selectedTags.map((tag) => tag.value),
          isPublic: resource.isPublic,
          isHot: resource.isHot,
          isTrending: resource.isTrending,
        }),
      });

      if (!response.ok) throw new Error("Failed to update resource");

      toast({
        title: "Success",
        description: "Resource updated successfully",
      });

      router.push("/admin/resources");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!resource) return null;

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
          <h1 className="text-4xl font-black mb-4">Edit Resource</h1>
          <p className="text-xl text-muted-foreground">
            Update resource details
          </p>
          {isSuperAdmin && (
            <span className="inline-block mt-2 px-3 py-1 text-sm font-bold bg-pink-500 text-white border-2 border-black shadow-neo-sm">
              Super Admin
            </span>
          )}
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
              Edit the details for this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={resource.title}
                  onChange={(e) =>
                    setResource({ ...resource, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={resource.url}
                    onChange={(e) =>
                      setResource({ ...resource, url: e.target.value })
                    }
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={scraping || !resource.url}
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
              {resource.thumbnail && (
                <div className="space-y-2">
                  <Label className="font-bold">Thumbnail Preview</Label>
                  <div className="w-full h-48 border-2 border-black overflow-hidden bg-gray-100">
                    <img
                      src={resource.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setResource({ ...resource, thumbnail: null });
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
                    onClick={() =>
                      setResource({ ...resource, thumbnail: null })
                    }
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
                  value={resource.thumbnail || ""}
                  onChange={(e) =>
                    setResource({
                      ...resource,
                      thumbnail: e.target.value || null,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty or use Auto-fill to fetch from URL metadata
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={resource.categoryId}
                  onValueChange={(value) =>
                    setResource({ ...resource, categoryId: value })
                  }
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
                <Label>Tags</Label>
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
                  value={resource.description}
                  onChange={(e) =>
                    setResource({ ...resource, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* Visibility Switch */}
              <div className="flex items-center justify-between p-4 border-2 border-black bg-gray-50">
                <div className="flex items-center gap-3">
                  {resource.isPublic ? (
                    <Globe className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <Label
                      htmlFor="visibility"
                      className="font-bold cursor-pointer"
                    >
                      {resource.isPublic ? "Public" : "Private"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {resource.isPublic
                        ? isSuperAdmin
                          ? "Visible to everyone"
                          : "May require approval if changed"
                        : "Only visible to you"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="visibility"
                  checked={resource.isPublic}
                  onCheckedChange={(checked) =>
                    setResource({ ...resource, isPublic: checked })
                  }
                />
              </div>

              {/* Super Admin Only: Hot & Trending Labels */}
              {isSuperAdmin && (
                <div className="space-y-4 p-4 border-2 border-pink-500 bg-pink-50">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold bg-pink-500 text-white border border-black">
                      SUPER ADMIN ONLY
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      Resource Labels
                    </span>
                  </div>

                  {/* Hot Label Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded ${
                          resource.isHot ? "bg-orange-500" : "bg-gray-200"
                        }`}
                      >
                        <Flame
                          className={`h-5 w-5 ${
                            resource.isHot ? "text-white" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="isHot"
                          className="font-bold cursor-pointer"
                        >
                          Hot Resource
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Mark this resource as hot/popular
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="isHot"
                      checked={resource.isHot}
                      onCheckedChange={(checked) =>
                        setResource({ ...resource, isHot: checked })
                      }
                    />
                  </div>

                  {/* Trending Label Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded ${
                          resource.isTrending ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <TrendingUp
                          className={`h-5 w-5 ${
                            resource.isTrending ? "text-white" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="isTrending"
                          className="font-bold cursor-pointer"
                        >
                          Trending Resource
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Mark this resource as trending
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="isTrending"
                      checked={resource.isTrending}
                      onCheckedChange={(checked) =>
                        setResource({ ...resource, isTrending: checked })
                      }
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
