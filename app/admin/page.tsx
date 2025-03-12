"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FolderKanban, Link2, Tag } from "lucide-react";
import Link from "next/link";
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
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Resources",
    description: "Add and edit resources within categories",
    icon: Link2,
    href: "/admin/resources",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Tags",
    description: "Manage resource tags and their appearance",
    icon: Tag,
    href: "/admin/tags",
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function AdminDashboardPage() {
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
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage your frontend resources collection
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={section.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}
                  >
                    <section.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
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
        className="mt-12 p-6 bg-muted/50 rounded-lg"
      >
        <h2 className="text-xl font-semibold mb-2">Quick Tips</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Categories should be broad enough to group related resources</li>
          <li>Ensure resource URLs are valid and accessible</li>
          <li>
            Write clear, concise descriptions for better user understanding
          </li>
          <li>Use tags to make resources more discoverable</li>
        </ul>
      </motion.div>
    </div>
  );
}
