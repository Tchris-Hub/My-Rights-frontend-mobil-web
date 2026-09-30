"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";

const links = [
  { href: "#story", label: "Why MY RIGHTS" },
  { href: "#story", label: "How it works" },
  { href: "/chat", label: "Try it" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("#") && pathname !== "/") {
      window.location.href = "/" + href;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#f7f8f6]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-lg font-bold tracking-[-0.03em] text-[#10211d]">
            MY <span className="text-[#a37b25]">RIGHTS</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={() => go(link.href)}
                className="text-sm font-medium text-[#10211d]/60 transition hover:text-[#10211d]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#10211d]/60 transition hover:text-[#10211d]"
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="px-3 py-2 text-sm font-medium text-[#10211d]/65 hover:text-[#10211d]">
            Sign in
          </Link>
          <Link
            href="#download"
            className="group inline-flex items-center gap-2 rounded-full bg-[#10211d] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Get the app
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded-full p-2 text-[#10211d] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-black/5 bg-[#f7f8f6] md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5">
              {links.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => go(link.href)}
                    className="rounded-2xl px-4 py-3 font-medium hover:bg-black/5"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 font-medium hover:bg-black/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                href="#download"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#10211d] px-5 py-3 font-semibold text-white"
              >
                Get the app <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
