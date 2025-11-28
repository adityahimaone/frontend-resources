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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const router = useRouter();
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          url,
          description,
          categoryId,
          tagIds: selectedTags.map((tag) => tag.value),
        }),
      });

      if (!response.ok) throw new Error("Failed to create resource");

      toast({
        title: "Success",
        description: "Resource created successfully",
      });

      router.push("/admin/resources");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resource",
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
          <h1 className="text-4xl font-bold mb-4">New Resource</h1>
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
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>
              Enter the details for the new resource
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Resource"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
