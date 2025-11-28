"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  FolderKanban,
  Link2,
  Tag,
  Users,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const adminSections = [
  {
    title: "Categories",
    description: "Manage resource categories and their organization",
    icon: FolderKanban,
    href: "/admin/categories",
    color: "bg-blue-100 border-blue-500",
    iconColor: "text-blue-600",
  },
  {
    title: "Resources",
    description: "Add and edit resources within categories",
    icon: Link2,
    href: "/admin/resources",
    color: "bg-green-100 border-green-500",
    iconColor: "text-green-600",
  },
  {
    title: "Tags",
    description: "Manage resource tags and their appearance",
    icon: Tag,
    href: "/admin/tags",
    color: "bg-purple-100 border-purple-500",
    iconColor: "text-purple-600",
  },
];

const superAdminSections = [
  {
    title: "Users",
    description: "Manage user accounts and roles",
    icon: Users,
    href: "/admin/users",
    color: "bg-pink-100 border-pink-500",
    iconColor: "text-pink-600",
  },
  {
    title: "Approvals",
    description: "Review and approve pending content",
    icon: CheckCircle,
    href: "/admin/approvals",
    color: "bg-yellow-100 border-yellow-500",
    iconColor: "text-yellow-600",
  },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const allSections = isSuperAdmin
    ? [...adminSections, ...superAdminSections]
    : adminSections;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage your frontend resources collection
          </p>
          {isSuperAdmin && (
            <span className="inline-block mt-2 px-3 py-1 text-sm font-bold bg-pink-500 text-white border-2 border-black shadow-neo-sm">
              Super Admin
            </span>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={section.href}>
              <Card
                className={`h-full border-2 border-black shadow-neo hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-pointer ${section.color}`}
              >
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-lg border-2 border-black bg-white flex items-center justify-center mb-4 ${section.iconColor}`}
                  >
                    <section.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="font-black text-xl">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 p-6 bg-cyan-100 border-2 border-black shadow-neo"
      >
        <h2 className="text-xl font-black mb-3">Quick Tips</h2>
        <ul className="list-disc list-inside space-y-2 font-medium">
          <li>Categories should be broad enough to group related resources</li>
          <li>Ensure resource URLs are valid and accessible</li>
          <li>
            Write clear, concise descriptions for better user understanding
          </li>
          <li>Use tags to make resources more discoverable</li>
          {isSuperAdmin && (
            <>
              <li className="text-pink-700">
                As Super Admin, you can approve public content
              </li>
              <li className="text-pink-700">
                You can manage user roles from the Users section
              </li>
            </>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
