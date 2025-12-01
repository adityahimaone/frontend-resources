"use client";

import { motion } from "framer-motion";
import { CodeXmlIcon, LogIn, LogOut, Menu, Bookmark } from "lucide-react";
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
        "absolute top-0 left-0 right-0 z-50 border-b-2 border-black bg-white",
        isHomePage
          ? "bg-white"
          : "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 items-center">
            <div
              className={cn(
                `w-6 h-6 md:w-10 shrink-0 md:h-10 border-2 border-black flex items-center justify-center bg-yellow-400 shadow-neo-sm`
              )}
            >
              <CodeXmlIcon className="h-6 w-6 text-black" />
            </div>
            <Link
              href="/"
              className={cn(
                "text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tighter text-black"
              )}
            >
              Frontend Resources
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <nav className="hidden md:flex items-center gap-6">
              <Search />
              {/* <CommandSearch /> */}
              <Link
                href="/categories"
                className={cn(
                  "font-bold text-black hover:bg-pink-400 hover:text-black px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-neo-sm transition-all",
                  isActive("/categories")
                    ? "bg-pink-400 border-black shadow-neo-sm"
                    : ""
                )}
              >
                Categories
              </Link>
              <Link
                href="/resources"
                className={cn(
                  "font-bold text-black hover:bg-blue-400 hover:text-black px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-neo-sm transition-all",
                  isActive("/resources")
                    ? "bg-blue-400 border-black shadow-neo-sm"
                    : ""
                )}
              >
                Resources
              </Link>
              {isAuthenticated && (
                <Link
                  href="/bookmarks"
                  className={cn(
                    "font-bold text-black hover:bg-yellow-400 hover:text-black px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-neo-sm transition-all flex items-center gap-2",
                    isActive("/bookmarks")
                      ? "bg-yellow-400 border-black shadow-neo-sm"
                      : ""
                  )}
                >
                  Bookmarks
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  href="/admin"
                  className={cn(
                    "font-bold text-black hover:bg-green-400 hover:text-black px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-neo-sm transition-all",
                    isActive("/admin")
                      ? "bg-green-400 border-black shadow-neo-sm"
                      : ""
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  className="bg-red-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-green-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Link href="/auth/signin">
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
                        href="/bookmarks"
                        className={cn(
                          "px-2 py-1 rounded-md transition-colors flex items-center gap-2",
                          isActive("/bookmarks")
                            ? "bg-primary/10 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Bookmark className="h-4 w-4" />
                        Bookmarks
                      </Link>
                    )}
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
                        className="w-full bg-red-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-green-400 text-black font-bold border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <Link href="/auth/signin">
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
