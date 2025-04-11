import React, { CSSProperties, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, MapPin } from "lucide-react";

export interface PlanButtonProps extends ComponentPropsWithoutRef<"button"> {
  borderRadius?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PlanButton = React.forwardRef<
  HTMLButtonElement,
  PlanButtonProps
>(
  (
    {
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // Define the positions for the X marks along the path (values between 0 and 1)
    const xMarkPositions = [0.3, 0.55, 0.8];
    
    return (
      <button
        style={
          {
            "--radius": borderRadius,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Icons and text */}
        <div className="flex items-center space-x-2 relative z-10">
          <Home className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">{children}</span>
          <MapPin className="w-5 h-5 text-red-500" />
        </div>

        {/* Animated SVG with dotted path and X marks */}
        <div className="absolute inset-0 z-0">
          <motion.svg
            width="100%"
            height="100%"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            {/* Main path definition */}
            <defs>
              <path
                id="motionPath"
                d="M15 15 C 25 5, 35 25, 50 15 S 65 5, 85 15"
                stroke="none"
              />
            </defs>
            
            {/* Animated dotted line */}
            <motion.path
              d="M15 15 C 25 5, 35 25, 50 15 S 65 5, 85 15"
              stroke="rgba(96, 165, 250, 0.6)"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
            />
            
            {/* X Mark 1 */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 2 * xMarkPositions[0], // Delay based on path position
                repeat: Infinity,
                repeatDelay: 2.5 // Match main path duration + repeatDelay
              }}
            >
              <path 
                d="M30 8 L34 12 M34 8 L30 12" 
                stroke="rgba(239, 68, 68, 0.7)" 
                strokeWidth="1.5" 
              />
            </motion.g>
            
            {/* X Mark 2 */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 2 * xMarkPositions[1], // Delay based on path position
                repeat: Infinity,
                repeatDelay: 2.5 // Match main path duration + repeatDelay
              }}
            >
              <path 
                d="M50 12 L54 16 M54 12 L50 16" 
                stroke="rgba(239, 68, 68, 0.7)" 
                strokeWidth="1.5" 
              />
            </motion.g>
            
            {/* X Mark 3 */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 2 * xMarkPositions[2], // Delay based on path position
                repeat: Infinity,
                repeatDelay: 2.5 // Match main path duration + repeatDelay
              }}
            >
              <path 
                d="M70 8 L74 12 M74 8 L70 12" 
                stroke="rgba(239, 68, 68, 0.7)" 
                strokeWidth="1.5" 
              />
            </motion.g>
          </motion.svg>
        </div>
      </button>
    );
  },
);

PlanButton.displayName = "PlanButton";