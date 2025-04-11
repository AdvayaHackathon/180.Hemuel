"use client";

import type React from "react"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronRight,Telescope,History } from "lucide-react";
import { Instagram,TentTree } from 'lucide-react';
import Link from "next/link";

interface ViewpastExplorationProps {
  className?: string;
}
 function ViewpastExploration({ className = "" }: ViewpastExplorationProps) {
 

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-8">
  {/* Explore New Button */}
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link href="/Explore/NewExplore">
      <button
        type="button"
        className={`
          text-white font-medium 
          py-3 px-6 rounded-md 
          shadow-md hover:shadow-lg
          transition-all duration-300
          flex items-center justify-center gap-2
          relative overflow-hidden
          group
          ${className}
        `}
        aria-label="Start New exploration"
      >
        {/* Background layer with animation - now transparent with darker nature colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 via-amber-800/70 to-emerald-800/70 transition-all duration-500 group-hover:from-amber-800/80 group-hover:via-emerald-900/80 group-hover:to-amber-900/80"></div>
        
        {/* Animated trees and monuments pattern - darkened */}
        <div className="absolute inset-0">
          {/* Tree silhouettes at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
          
          {/* Monument silhouette (simple Eiffel Tower-like shape) */}
          <div className="absolute bottom-0 left-1/4 w-1 h-6 bg-black opacity-30 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-1/4 w-3 h-1 bg-black opacity-30 transform origin-bottom translate-x-[-1px] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 delay-100"></div>
          
          {/* Tree silhouettes that grow on hover */}
          <div className="absolute bottom-0 left-1/2 w-2 h-4 bg-black opacity-30 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-1/2 w-4 h-2 bg-black opacity-30 transform origin-bottom translate-x-[-1px] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 delay-75"></div>
          
          {/* Another monument (pyramid-like) */}
          <div className="absolute bottom-0 right-1/4 w-4 h-4 bg-black opacity-30 clip-path-triangle transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 delay-150"></div>
        </div>
        
        {/* Subtle texture overlay - darkened */}
        <div className="absolute inset-0 opacity-10 bg-[url('/texture.png')] bg-repeat group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          <Telescope className="transition-transform duration-300 group-hover:rotate-12"/> 
          Explore New!
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
        
        {/* Subtle light rays from top - reduced brightness */}
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </button>
    </Link>
  </motion.div>
</div>
  );
}
interface NewExplorationProps {
    className?: string;
  }
function  NewExploration({ className = "" }:  NewExplorationProps) {
    
  
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-8">
        
        
  
        {/* Exploration History */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/ExploreHistory">
            <button
              type="button"
              className={`
                  bg-pink-500 hover:bg-pink-600 
                  text-white font-medium 
                  py-3 px-6 rounded-md 
                  shadow-md hover:shadow-lg
                  transition-all duration-300
                  flex items-center justify-center gap-2
                  bg-gradient-to-r from-pink-500 via-pink-400 to-purple-500
                  ${className}
                `}
              aria-label="Connect with Instagram"
            >
              <History/> View Exploration History
              <ChevronRight className="h-5 w-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <TentTree className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-space font-bold">Explore</h1>
              <p className="text-muted-foreground">
                View Past Explorations or make a new one!
              </p>
            </div>
          </div>

          <ViewpastExploration />   < NewExploration />

          
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
