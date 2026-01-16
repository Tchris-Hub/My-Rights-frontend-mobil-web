import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
    className?: string;
    children: ReactNode;
}

export function Card({ className, children }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-muted bg-background p-6 shadow-sm transition-shadow hover:shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    className?: string;
    children: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
    return (
        <div className={cn("mb-4", className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    className?: string;
    children: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
    return (
        <h3 className={cn("text-xl font-semibold text-foreground", className)}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    className?: string;
    children: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
    return (
        <p className={cn("text-sm text-muted-foreground mt-1", className)}>
            {children}
        </p>
    );
}

interface CardContentProps {
    className?: string;
    children: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
    return <div className={cn("", className)}>{children}</div>;
}

interface CardFooterProps {
    className?: string;
    children: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
    return (
        <div className={cn("mt-6 flex items-center", className)}>
            {children}
        </div>
    );
}
