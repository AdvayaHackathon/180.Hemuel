"use client";

import { motion } from "framer-motion";
import { MapPinned,Map,TentTree } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <MapPinned className="w-8 h-8" />
            <span className="font-space font-bold text-xl">GuideBot.AI</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/Plan"
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>Plan</span>
            </Link>
            <Link
              href="/Explore/NewExplore"
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <TentTree className="w-4 h-4" />
              <span>Explore</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}