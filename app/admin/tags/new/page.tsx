"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Lock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

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

export default function NewTagPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
          isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tag");
      }

      toast({
        title: "Success",
        description:
          isPublic && !isSuperAdmin
            ? "Tag created and pending approval"
            : "Tag created successfully",
      });

      router.push("/admin/tags");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
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
          <Link href="/admin/tags">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tags
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black mb-4">New Tag</h1>
          <p className="text-xl text-muted-foreground">
            Create a new tag for resources
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-black shadow-neo">
          <CardHeader className="border-b-2 border-black bg-purple-100">
            <CardTitle className="font-black">Tag Details</CardTitle>
            <CardDescription className="font-medium">
              Enter the details for the new tag
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color" className="font-bold">
                  Color
                </Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((colorOption) => (
                      <SelectItem key={colorOption} value={colorOption}>
                        <div className="flex items-center gap-2">
                          <Badge className={colorOption}>Preview</Badge>
                          <span>{colorOption}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Preview</Label>
                <div className="pt-2">
                  <Badge className={`${color} border-2 border-black`}>
                    {name || "Tag Preview"}
                  </Badge>
                </div>
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
                {loading ? "Creating..." : "Create Tag"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
