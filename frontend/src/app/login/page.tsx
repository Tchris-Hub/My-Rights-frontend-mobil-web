"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, ArrowRight, Chrome } from "lucide-react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://alpha01-pink.vercel.app").replace(/\/$/, "");

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMagicLink = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/magic-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: normalizedEmail,
                    name: normalizedEmail.split("@")[0],
                    callbackURL: "/",
                    newUserCallbackURL: "/",
                    errorCallbackURL: "/login?error=auth",
                }),
            });

            if (!response.ok) throw new Error("We could not send the sign-in link. Please try again.");
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "We could not send the sign-in link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/social`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ provider: "google", callbackURL: "/" }),
            });
            const data = await response.json();
            if (!response.ok || !data?.url) {
                throw new Error(data?.message || "Google sign-in could not be started.");
            }
            window.location.assign(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign-in could not be started.");
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
                <div className="max-w-md text-center text-primary-foreground">
                    <h3 className="text-2xl font-bold mb-4">Your Digital Legal Companion</h3>
                    <p className="text-primary-foreground/80">
                        Sign in securely without creating or remembering a password.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="flex justify-center mb-8">
                        <Image src="/assets/logo.png" alt="My Rights Logo" width={64} height={64} className="rounded-xl" />
                    </Link>
                    <h2 className="text-center text-3xl font-bold text-foreground">Welcome back</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Use a one-time email link or Google.
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-background px-6 py-8 shadow-lg ring-1 ring-muted rounded-2xl">
                        {sent ? (
                            <div className="text-center space-y-4">
                                <Mail className="mx-auto h-12 w-12 text-primary" />
                                <h3 className="text-xl font-semibold">Check your email</h3>
                                <p className="text-sm text-muted-foreground">
                                    We sent a one-time sign-in link to <strong>{email.trim().toLowerCase()}</strong>.
                                    The link expires in 5 minutes and can only be used once.
                                </p>
                                <button onClick={() => setSent(false)} className="text-sm text-primary hover:underline">
                                    Use a different email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-5">
                                {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full rounded-lg border border-muted bg-background py-3 pl-10 pr-3"
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || googleLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                                    Email me a sign-in link
                                </button>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="h-px flex-1 bg-muted" />
                                    OR
                                    <div className="h-px flex-1 bg-muted" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogle}
                                    disabled={isLoading || googleLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border border-muted hover:bg-muted/40 disabled:opacity-70"
                                >
                                    {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
                                    Continue with Google
                                </button>
                            </form>
                        )}
                    </div>

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        You can use My Rights without signing in.{" "}
                        <Link href="/chat" className="text-primary hover:underline">Continue as guest</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
