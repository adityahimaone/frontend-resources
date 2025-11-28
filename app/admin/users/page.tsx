"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Users,
  Shield,
  UserCog,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "SUPER_ADMIN" | "GENERAL";
  createdAt: string;
  updatedAt: string;
  _count: {
    resources: number;
    categories: number;
    tags: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
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

  const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN");
  const generalUsers = users.filter((u) => u.role === "GENERAL");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user roles and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-black shadow-neo bg-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo bg-pink-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase">
                Super Admins
              </CardTitle>
              <Shield className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{superAdmins.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo bg-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase">
                General Users
              </CardTitle>
              <UserCog className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{generalUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-2 border-black shadow-neo">
          <CardHeader className="border-b-2 border-black bg-green-100">
            <CardTitle className="font-black">All Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Content</TableHead>
                  <TableHead className="font-bold">Joined</TableHead>
                  <TableHead className="font-bold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "SUPER_ADMIN" ? "default" : "secondary"
                        }
                        className={
                          user.role === "SUPER_ADMIN"
                            ? "bg-pink-500 hover:bg-pink-600"
                            : ""
                        }
                      >
                        {user.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : "General"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user._count.resources} resources
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {user._count.categories} categories
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {user._count.tags} tags
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={
                            updating === user.id || user.id === session.user.id
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GENERAL">General</SelectItem>
                            <SelectItem value="SUPER_ADMIN">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={user.id === session.user.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This
                                action cannot be undone. All content created by
                                this user will also be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
