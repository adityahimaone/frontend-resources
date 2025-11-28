"use client";

import { motion } from "framer-motion";
import { CodeXmlIcon, LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search } from "./search";
import { cn } from "@/lib/utils";
import GradientText from "./animation/GradientText";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { CommandSearch } from "./command-search";

export function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isHomePage = pathname === "/";

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      router.push("/");
      router.refresh();
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
      className={cn(
        "absolute top-0 left-0 right-0 z-50 ",
        isHomePage
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 items-center">
            <div
              className={cn(
                `w-8 h-8 rounded-lg flex items-center justify-center`,
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
                  "text-base md:text-xl font-bold custom-class",
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
              {/* <CommandSearch /> */}
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
              <Link
                href="/resources"
                className={cn(
                  "transition-colors",
                  isActive("/resources")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Resources
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

            <div className="hidden md:flex items-center gap-4">
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
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-end w-full py-3">
                    <Search />
                  </div>
                  <nav className="flex flex-col gap-2">
                    <Link
                      href="/categories"
                      className={cn(
                        "px-2 py-1 rounded-md transition-colors",
                        isActive("/categories")
                          ? "bg-primary/10 text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/resources"
                      className={cn(
                        "px-2 py-1 rounded-md transition-colors",
                        isActive("/resources")
                          ? "bg-primary/10 text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Resources
                    </Link>
                    {isAuthenticated && (
                      <Link
                        href="/admin"
                        className={cn(
                          "px-2 py-1 rounded-md transition-colors",
                          isActive("/admin")
                            ? "bg-primary/10 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Dashboard
                      </Link>
                    )}
                  </nav>
                  <div className="mt-4">
                    {isAuthenticated ? (
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Button asChild variant="ghost" className="w-full">
                        <Link href="/admin/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
