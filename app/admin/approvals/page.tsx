"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Link2,
  FolderKanban,
  Tag,
  ArrowLeft,
  Globe,
  Clock,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface PendingResource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: { name: string } | null;
  tags: { name: string; color: string | null }[];
  user: { name: string | null; email: string };
  createdAt: string;
}

interface PendingCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  user: { name: string | null; email: string };
  createdAt: string;
}

interface PendingTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  user: { name: string | null; email: string };
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<PendingResource[]>([]);
  const [categories, setCategories] = useState<PendingCategory[]>([]);
  const [tags, setTags] = useState<PendingTag[]>([]);
  const [rejectedResources, setRejectedResources] = useState<PendingResource[]>(
    []
  );
  const [rejectedCategories, setRejectedCategories] = useState<
    PendingCategory[]
  >([]);
  const [rejectedTags, setRejectedTags] = useState<PendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "rejected">("pending");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }

    fetchAllItems();
  }, [session, status, router]);

  const fetchAllItems = async () => {
    await Promise.all([fetchPendingItems(), fetchRejectedItems()]);
    setLoading(false);
  };

  const fetchPendingItems = async () => {
    try {
      const res = await fetch("/api/admin/approval?status=PENDING");
      if (!res.ok) throw new Error("Failed to fetch pending items");
      const data = await res.json();
      setResources(data.resources || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
    } catch (error) {
      toast.error("Failed to fetch pending items");
    }
  };

  const fetchRejectedItems = async () => {
    try {
      const res = await fetch("/api/admin/approval?status=REJECTED");
      if (!res.ok) throw new Error("Failed to fetch rejected items");
      const data = await res.json();
      setRejectedResources(data.resources || []);
      setRejectedCategories(data.categories || []);
      setRejectedTags(data.tags || []);
    } catch (error) {
      toast.error("Failed to fetch rejected items");
    }
  };

  const handleApproval = async (
    type: string,
    id: string,
    newStatus: "APPROVED" | "REJECTED" | "PENDING"
  ) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const statusText =
        newStatus === "PENDING"
          ? "reverted to pending"
          : newStatus.toLowerCase();
      toast.success(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } ${statusText} successfully`
      );
      fetchAllItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to update approval status");
    } finally {
      setProcessing(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return null;
  }

  const totalPending = resources.length + categories.length + tags.length;
  const totalRejected =
    rejectedResources.length + rejectedCategories.length + rejectedTags.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Content Approvals</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve pending public content
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="text-lg px-4 py-2 border-2 border-black bg-yellow-100"
            >
              <Clock className="mr-2 h-4 w-4" />
              {totalPending} Pending
            </Badge>
            <Badge
              variant="outline"
              className="text-lg px-4 py-2 border-2 border-black bg-red-100"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {totalRejected} Rejected
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Tabs: Pending vs Rejected */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pending" | "rejected")}
        className="space-y-4"
      >
        <TabsList className="border-2 border-black p-1 bg-white">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-yellow-200 font-bold"
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending ({totalPending})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-red-200 font-bold"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejected ({totalRejected})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab Content */}
        <TabsContent value="pending" className="space-y-4">
          <Tabs defaultValue="resources" className="space-y-4">
            <TabsList className="border-2 border-black p-1 bg-white">
              <TabsTrigger
                value="resources"
                className="data-[state=active]:bg-green-200 font-bold"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Resources ({resources.length})
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-blue-200 font-bold"
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Categories ({categories.length})
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:bg-purple-200 font-bold"
              >
                <Tag className="mr-2 h-4 w-4" />
                Tags ({tags.length})
              </TabsTrigger>
            </TabsList>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              {resources.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-green-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="font-bold text-lg">All caught up!</p>
                    <p className="text-muted-foreground">
                      No pending resources to review
                    </p>
                  </CardContent>
                </Card>
              ) : (
                resources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="border-2 border-black shadow-neo"
                  >
                    <CardHeader className="border-b-2 border-black bg-green-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-black text-xl flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {resource.title}
                          </CardTitle>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {resource.url}
                          </a>
                        </div>
                        <Badge variant="secondary">
                          {resource.category?.name || "Uncategorized"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {resource.description && (
                        <p className="text-muted-foreground">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <Badge
                            key={tag.name}
                            style={{
                              backgroundColor: tag.color || undefined,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {resource.user.name || resource.user.email} •{" "}
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval(
                                "resource",
                                resource.id,
                                "APPROVED"
                              )
                            }
                            disabled={processing === resource.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            {processing === resource.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleApproval(
                                "resource",
                                resource.id,
                                "REJECTED"
                              )
                            }
                            disabled={processing === resource.id}
                            className="border-2 border-black shadow-neo-sm"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              {categories.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-blue-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <p className="font-bold text-lg">All caught up!</p>
                    <p className="text-muted-foreground">
                      No pending categories to review
                    </p>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category) => (
                  <Card
                    key={category.id}
                    className="border-2 border-black shadow-neo"
                  >
                    <CardHeader className="border-b-2 border-black bg-blue-100">
                      <CardTitle className="font-black text-xl flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Slug: {category.slug}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {category.description && (
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {category.user.name || category.user.email} •{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval(
                                "category",
                                category.id,
                                "APPROVED"
                              )
                            }
                            disabled={processing === category.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            {processing === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleApproval(
                                "category",
                                category.id,
                                "REJECTED"
                              )
                            }
                            disabled={processing === category.id}
                            className="border-2 border-black shadow-neo-sm"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-4">
              {tags.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-purple-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                    <p className="font-bold text-lg">All caught up!</p>
                    <p className="text-muted-foreground">
                      No pending tags to review
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="border-2 border-black shadow-neo"
                  >
                    <CardHeader className="border-b-2 border-black bg-purple-100">
                      <CardTitle className="font-black text-xl flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {tag.name}
                        {tag.color && (
                          <span
                            className="w-6 h-6 rounded border-2 border-black"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Slug: {tag.slug}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {tag.user.name || tag.user.email} •{" "}
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval("tag", tag.id, "APPROVED")
                            }
                            disabled={processing === tag.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            {processing === tag.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleApproval("tag", tag.id, "REJECTED")
                            }
                            disabled={processing === tag.id}
                            className="border-2 border-black shadow-neo-sm"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Rejected Tab Content */}
        <TabsContent value="rejected" className="space-y-4">
          <Tabs defaultValue="resources" className="space-y-4">
            <TabsList className="border-2 border-black p-1 bg-white">
              <TabsTrigger
                value="resources"
                className="data-[state=active]:bg-green-200 font-bold"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Resources ({rejectedResources.length})
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-blue-200 font-bold"
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Categories ({rejectedCategories.length})
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:bg-purple-200 font-bold"
              >
                <Tag className="mr-2 h-4 w-4" />
                Tags ({rejectedTags.length})
              </TabsTrigger>
            </TabsList>

            {/* Rejected Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              {rejectedResources.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-green-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="font-bold text-lg">No rejected resources</p>
                    <p className="text-muted-foreground">
                      All resources have been processed
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="border-2 border-black shadow-neo border-l-4 border-l-red-500"
                  >
                    <CardHeader className="border-b-2 border-black bg-red-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-black text-xl flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            {resource.title}
                          </CardTitle>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {resource.url}
                          </a>
                        </div>
                        <Badge variant="destructive">REJECTED</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {resource.description && (
                        <p className="text-muted-foreground">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {resource.user.name || resource.user.email} •{" "}
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval("resource", resource.id, "PENDING")
                            }
                            disabled={processing === resource.id}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black shadow-neo-sm"
                          >
                            {processing === resource.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="mr-2 h-4 w-4" />
                            )}
                            Revert to Pending
                          </Button>
                          <Button
                            onClick={() =>
                              handleApproval(
                                "resource",
                                resource.id,
                                "APPROVED"
                              )
                            }
                            disabled={processing === resource.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Rejected Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              {rejectedCategories.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-blue-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <p className="font-bold text-lg">No rejected categories</p>
                    <p className="text-muted-foreground">
                      All categories have been processed
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="border-2 border-black shadow-neo border-l-4 border-l-red-500"
                  >
                    <CardHeader className="border-b-2 border-black bg-red-50">
                      <CardTitle className="font-black text-xl flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Slug: {category.slug}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {category.description && (
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {category.user.name || category.user.email} •{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval("category", category.id, "PENDING")
                            }
                            disabled={processing === category.id}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black shadow-neo-sm"
                          >
                            {processing === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="mr-2 h-4 w-4" />
                            )}
                            Revert to Pending
                          </Button>
                          <Button
                            onClick={() =>
                              handleApproval(
                                "category",
                                category.id,
                                "APPROVED"
                              )
                            }
                            disabled={processing === category.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Rejected Tags Tab */}
            <TabsContent value="tags" className="space-y-4">
              {rejectedTags.length === 0 ? (
                <Card className="border-2 border-black shadow-neo bg-purple-50">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                    <p className="font-bold text-lg">No rejected tags</p>
                    <p className="text-muted-foreground">
                      All tags have been processed
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedTags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="border-2 border-black shadow-neo border-l-4 border-l-red-500"
                  >
                    <CardHeader className="border-b-2 border-black bg-red-50">
                      <CardTitle className="font-black text-xl flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        {tag.name}
                        {tag.color && (
                          <span
                            className="w-6 h-6 rounded border-2 border-black"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Slug: {tag.slug}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-black">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {tag.user.name || tag.user.email} •{" "}
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleApproval("tag", tag.id, "PENDING")
                            }
                            disabled={processing === tag.id}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black shadow-neo-sm"
                          >
                            {processing === tag.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="mr-2 h-4 w-4" />
                            )}
                            Revert to Pending
                          </Button>
                          <Button
                            onClick={() =>
                              handleApproval("tag", tag.id, "APPROVED")
                            }
                            disabled={processing === tag.id}
                            className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-neo-sm"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
