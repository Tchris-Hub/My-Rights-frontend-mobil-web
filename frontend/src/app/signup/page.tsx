"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || password !== confirmPassword) {
            setError("Please fill all fields and ensure passwords match.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // TODO: Implement actual signup
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // Redirect or update state on success
        } catch (err) {
            setError("Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
                <div className="max-w-md text-center text-primary-foreground">
                    <h3 className="text-2xl font-bold mb-4">
                        Join Thousands of Nigerians
                    </h3>
                    <p className="text-primary-foreground/80">
                        Create an account to save your conversations, get personalized legal insights, and unlock all features of My Rights.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm:mx-auto sm:w-full sm:max-w-md"
                >
                    <Link href="/" className="flex justify-center mb-8">
                        <Image
                            src="/assets/logo.png"
                            alt="My Rights Logo"
                            width={64}
                            height={64}
                            className="rounded-xl"
                        />
                    </Link>
                    <h2 className="text-center text-3xl font-bold text-foreground">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Start your journey to understanding Nigerian law
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-10 sm:mx-auto sm:w-full sm:max-w-md"
                >
                    <div className="bg-background px-6 py-8 shadow-lg ring-1 ring-muted rounded-2xl">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <label className="flex items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded border-muted text-primary focus:ring-primary"
                                    required
                                />
                                <span className="text-muted-foreground">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                    isLoading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-muted" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-background text-muted-foreground">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                    Sign in instead
                                </Link>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        You can use My Rights without signing up.{" "}
                        <Link href="/chat" className="text-primary hover:underline">
                            Continue as guest
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
