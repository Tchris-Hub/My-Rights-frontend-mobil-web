"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-2.5 rounded-lg border border-muted bg-background text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "transition-colors duration-200",
                        error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={id}
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 rounded-lg border border-muted bg-background text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "transition-colors duration-200 resize-none",
                        error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
