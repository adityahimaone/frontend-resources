"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CodeXmlIcon, LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Search } from "./search";
import { cn } from "@/lib/utils";
import GradientText from "./animation/GradientText";

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <div
              className={cn(
                `w-8 h-8 rounded-lg  flex items-center justify-center`,
                isActive("/")
                  ? "text-blue-500 bg-blue-500/10"
                  : "text-purple-500 bg-purple-500/10"
              )}
            >
              <CodeXmlIcon className="h-6 w-6" />
            </div>
            <Link
              href="/"
              className={cn(
                "text-2xl font-bold",
                isActive("/")
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-500 transition-colors"
              )}
            >
              <GradientText
                colors={
                  isActive("/")
                    ? ["#38bdf8", "#3b82f6", "#38bdf8", "#3b82f6", "#38bdf8"]
                    : ["#9c40ff", "#7f9cf5", "#9c40ff", "#7f9cf5", "#9c40ff"]
                }
                animationSpeed={3}
                showBorder={false}
                className={cn(
                  "text-xl font-bold custom-class mt-0.5",
                  isActive("/") ? "" : "text-muted-foreground "
                )}
              >
                Frontend Resources
              </GradientText>
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <nav className="hidden md:flex items-center gap-6">
              <Search />
              <Link
                href="/categories"
                className={cn(
                  "transition-colors",
                  isActive("/categories")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Categories
              </Link>
              {isAuthenticated && (
                <Link
                  href="/admin"
                  className={cn(
                    "transition-colors",
                    isActive("/admin")
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/admin/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href="/categories"
                    className={cn(isActive("/categories") && "font-medium")}
                  >
                    Categories
                  </Link>
                </DropdownMenuItem>
                {isAuthenticated && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/resources"
                      className={cn(isActive("/admin") && "font-medium")}
                    >
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
