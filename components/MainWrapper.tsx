"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Squares from "./animation/SquaresBackground";
import Iridescence from "./animation/IridescenceBackground";

interface MainWrapperProps {
  children: React.ReactNode;
}

export function MainWrapper({ children }: MainWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <main className={cn("flex-1", !isHomePage ? "pt-[72px]" : "")}>
      {children}
    </main>
  );
}
