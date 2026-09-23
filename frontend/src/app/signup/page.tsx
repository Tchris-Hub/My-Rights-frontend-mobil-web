"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-6">
            <p className="text-sm text-muted-foreground">Redirecting to secure passwordless sign-in…</p>
        </main>
    );
}
