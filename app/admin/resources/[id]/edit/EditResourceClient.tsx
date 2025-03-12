"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MultiSelect, Option } from "@/components/ui/multi-select";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category_id: string;
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

interface ResourceTag {
  resource_id: string;
  tag_id: string;
  tags: Tag;
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchResource();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;

      if (data) {
        setCategories(data);
      }
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
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;

      if (data) {
        setTags(
          data.map((tag) => ({
            value: tag.id,
            label: tag.name,
            color: tag.color,
          }))
        );
      }
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
      // Fetch resource
      const { data: resourceData, error: resourceError } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .single();

      if (resourceError) throw resourceError;

      // Fetch resource tags
      const { data: tagData, error: tagError } = await supabase
        .from("resource_tags")
        .select(
          `
          resource_id,
          tag_id,
          tags (
            id,
            name,
            color
          )
        `
        )
        .eq("resource_id", id);

      if (tagError) throw tagError;

      if (resourceData) {
        setResource(resourceData);
      }

      if (tagData && Array.isArray(tagData)) {
        const extractedTags = tagData.map((rt: any) => ({
          value: rt.tags.id,
          label: rt.tags.name,
          color: rt.tags.color,
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
      // Generate a random color from the TAG_COLORS array
      const randomColor =
        TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

      const { data, error } = await supabase
        .from("tags")
        .insert([
          {
            name,
            color: randomColor,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTag = {
          value: data.id,
          label: data.name,
          color: data.color,
        };
        setTags([...tags, newTag]);
        setSelectedTags([...selectedTags, newTag]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;

    setSaving(true);

    try {
      // Update resource
      const { error: resourceError } = await supabase
        .from("resources")
        .update({
          title: resource.title,
          url: resource.url,
          description: resource.description,
          category_id: resource.category_id,
        })
        .eq("id", resource.id);

      if (resourceError) throw resourceError;

      // Delete existing tag associations
      const { error: deleteError } = await supabase
        .from("resource_tags")
        .delete()
        .eq("resource_id", resource.id);

      if (deleteError) throw deleteError;

      // Create new tag associations
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from("resource_tags").insert(
          selectedTags.map((tag) => ({
            resource_id: resource.id,
            tag_id: tag.value,
          }))
        );

        if (tagError) throw tagError;
      }

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
          <h1 className="text-4xl font-bold mb-4">Edit Resource</h1>
          <p className="text-xl text-muted-foreground">
            Update resource details
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>
              Edit the details for this resource
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Input
                  id="url"
                  type="url"
                  value={resource.url}
                  onChange={(e) =>
                    setResource({ ...resource, url: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={resource.category_id}
                  onValueChange={(value) =>
                    setResource({ ...resource, category_id: value })
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={resource.description}
                  onChange={(e) =>
                    setResource({ ...resource, description: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
