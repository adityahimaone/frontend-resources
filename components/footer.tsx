"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t mt-auto"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}
            <a
              href="https://adityahimaone.engineer"
              className="text-muted-foreground hover:text-foreground transition-colors ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              adityahimaone
            </a>
            .<span className="ml-2">All rights reserved.</span>
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/adityahimaone/frontend-resources"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
