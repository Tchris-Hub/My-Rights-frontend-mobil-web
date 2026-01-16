"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary:
                "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
            secondary:
                "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary/50",
            outline:
                "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/50",
            ghost:
                "text-foreground hover:bg-muted focus:ring-muted",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-5 py-2.5 text-base",
            lg: "px-7 py-3.5 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

// Motion-enabled button for animations
const MotionButton = forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary:
                "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
            secondary:
                "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary/50",
            outline:
                "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/50",
            ghost:
                "text-foreground hover:bg-muted focus:ring-muted",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-5 py-2.5 text-base",
            lg: "px-7 py-3.5 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

MotionButton.displayName = "MotionButton";

export { Button, MotionButton };
