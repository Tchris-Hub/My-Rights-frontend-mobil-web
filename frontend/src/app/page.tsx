"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  FileSearch,
  FileText,
  MessageSquare,
  ShieldCheck,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

const stories = [
  {
    number: "01",
    eyebrow: "ASK",
    title: "Start with the question you actually have.",
    copy: "Legal language can make a simple problem feel impossible. MY RIGHTS lets Nigerians ask questions in ordinary language and understand the legal context behind the answer.",
    image:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "People having a professional conversation",
    href: "/chat",
    cta: "Ask a legal question",
    icon: MessageSquare,
  },
  {
    number: "02",
    eyebrow: "UNDERSTAND",
    title: "Read the document before you sign it.",
    copy: "Upload a contract or agreement and use document review to surface important clauses, explain what they mean, and help you see what deserves closer attention.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Documents and paperwork on a desk",
    href: "/review",
    cta: "Review a document",
    icon: FileSearch,
  },
  {
    number: "03",
    eyebrow: "PREPARE",
    title: "Turn a situation into something you can act on.",
    copy: "When you know what you need to say, MY RIGHTS can help structure common legal documents from the facts you provide—without pretending to replace a qualified lawyer.",
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Legal books and documents",
    href: "/generate",
    cta: "Create a document",
    icon: FileText,
  },
];

const principles = [
  "Plain-language legal information",
  "Nigerian legal context and sources",
  "Document understanding before action",
  "Practical preparation for real conversations",
];

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 0.45], [0, 260]);
  const phoneY = useTransform(scrollYProgress, [0, 0.35], [0, -90]);

  return (
    <main className="overflow-hidden bg-[#f7f8f6] text-[#10211d]">
      <Navbar />

      {/* HERO — establish the problem and the promise */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#10211d] text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2200&q=85"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,33,29,.98)_0%,rgba(16,33,29,.9)_48%,rgba(16,33,29,.35)_100%)]" />
        </div>

        <motion.div
          style={{ y: orbY }}
          className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#d8b25a]/20 blur-3xl"
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#e4c879]" />
                Built for everyday life in Nigeria
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                The law is complex.
                <span className="block text-[#e4c879]">Knowing your rights shouldn&apos;t be.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                MY RIGHTS is a digital legal-information companion designed to help Nigerians
                understand their rights, make sense of documents, and prepare for the next step
                with greater clarity.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#download"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#e4c879] px-7 py-4 font-semibold text-[#10211d] transition-transform hover:-translate-y-1"
                >
                  Get MY RIGHTS
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#story"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 font-medium text-white backdrop-blur transition hover:bg-white/10"
                >
                  See how it works
                  <ArrowDown className="h-5 w-5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/55">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#e4c879]" /> Information-first</span>
                <span className="inline-flex items-center gap-2"><Scale className="h-4 w-4 text-[#e4c879]" /> Nigeria-focused</span>
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#e4c879]" /> Human professionals still matter</span>
              </div>
            </Reveal>
          </div>

          <motion.div style={{ y: phoneY }} className="relative mx-auto hidden w-full max-w-[470px] lg:block">
            <div className="absolute -inset-10 rounded-full bg-[#d8b25a]/10 blur-3xl" />
            <div className="relative mx-auto aspect-[9/16] w-[280px] rotate-[2deg] rounded-[42px] border border-white/20 bg-[#172b26] p-3 shadow-[0_35px_100px_rgba(0,0,0,.45)]">
              <div className="h-full overflow-hidden rounded-[32px] bg-[#f4f6f2]">
                <div className="flex h-full flex-col p-5 text-[#10211d]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">MY RIGHTS</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-12">
                    <p className="text-xs text-black/45">Ask about your situation</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">What are my rights as a tenant?</p>
                  </div>
                  <div className="mt-auto rounded-3xl bg-white p-4 shadow-sm">
                    <div className="mb-3 h-2 w-16 rounded-full bg-[#e4c879]" />
                    <p className="text-xs leading-5 text-black/65">
                      Understand the issue. See the relevant context. Know what to ask next.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STORY INTRO */}
      <section id="story" className="bg-[#f7f8f6] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a37b25]">Why MY RIGHTS exists</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Legal literacy starts long before someone walks into a courtroom.
            </h2>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-black/60">
              A tenancy agreement. An employment dispute. A demand letter. A contract you do not
              fully understand. The first barrier is often not the absence of a law—it is knowing
              where to begin.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, index) => (
              <Reveal key={item} delay={index * 0.06}>
                <div className="h-full rounded-3xl border border-black/8 bg-white p-6 shadow-[0_12px_40px_rgba(16,33,29,.05)]">
                  <span className="text-sm font-semibold text-[#a37b25]">0{index + 1}</span>
                  <p className="mt-8 text-lg font-medium leading-7">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT JOURNEY */}
      <section className="bg-white px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a37b25]">One problem. A clearer path.</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Ask. Understand. Prepare.
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/60">
                The product is designed around the way real legal problems unfold—not around a
                list of flashy AI features.
              </p>
            </div>
          </Reveal>

          <div className="mt-20 space-y-28">
            {stories.map((story, index) => {
              const Icon = story.icon;
              const reversed = index % 2 === 1;
              return (
                <div key={story.number} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                  <Reveal className={reversed ? "lg:order-2" : ""}>
                    <div className="relative overflow-hidden rounded-[2rem]">
                      <img
                        src={story.image}
                        alt={story.imageAlt}
                        className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#10211d]">
                        {story.number}
                      </span>
                    </div>
                  </Reveal>

                  <Reveal delay={0.08} className={reversed ? "lg:order-1" : ""}>
                    <div className="max-w-xl">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10211d] text-[#e4c879]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-7 text-sm font-semibold uppercase tracking-[0.22em] text-[#a37b25]">
                        {story.eyebrow}
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                        {story.title}
                      </h3>
                      <p className="mt-5 text-lg leading-8 text-black/60">{story.copy}</p>
                      <Link
                        href={story.href}
                        className="mt-7 inline-flex items-center gap-2 font-semibold text-[#10211d] hover:text-[#a37b25]"
                      >
                        {story.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="relative overflow-hidden bg-[#e8eee9] px-6 py-24 lg:px-10 lg:py-32">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#d8b25a]/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a37b25]">The bigger idea</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Better legal literacy is not about turning everyone into a lawyer.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5">
              <p className="text-xl leading-9 text-[#20342e]">
                It is about helping more people recognise when something matters, understand the
                language in front of them, ask better questions, and know when a qualified
                professional should take over.
              </p>
              <div className="rounded-3xl bg-[#10211d] p-7 text-white shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e4c879]">
                  MY RIGHTS in one sentence
                </p>
                <p className="mt-4 text-2xl font-medium leading-9">
                  Give people enough clarity to take the next responsible step.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HUMAN HANDOFF */}
      <section className="bg-[#10211d] px-6 py-24 text-white lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#e4c879]">Technology with a boundary</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              AI can help you understand. It does not replace the human professional.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
              MY RIGHTS is built as an information and preparation layer. When a situation needs
              professional legal judgment, the right next step is still a qualified lawyer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Understand", "Review", "Prepare", "Escalate when needed"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=85"
                alt="People collaborating around a table"
                className="aspect-[4/3] w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10211d]/75 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-lg font-medium">When the stakes rise, clarity should help you reach the right human—not hide behind the technology.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES / CONVERSION */}
      <section id="download" className="relative overflow-hidden bg-[#f7f8f6] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="rounded-[2.5rem] bg-[#e4c879] px-7 py-14 text-[#10211d] sm:px-12 lg:px-16 lg:py-16">
              <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-black/50">Your next step</p>
                  <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    You should not have to wait until a legal problem becomes a crisis to start understanding it.
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
                    Get MY RIGHTS and put a practical legal-information companion in your pocket.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#10211d] px-7 py-4 font-semibold text-white transition hover:-translate-y-1"
                  >
                    Download MY RIGHTS
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/35 px-7 py-4 font-semibold transition hover:bg-white/60"
                  >
                    Try it on the web
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[
                ["Legal questions", "Ask in plain language"],
                ["Documents", "Review and prepare"],
                ["Real people", "Know when to seek counsel"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-black/8 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="h-4 w-4 text-emerald-700" />
                    {title}
                  </div>
                  <p className="mt-2 text-sm text-black/55">{copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-black/8 bg-[#f7f8f6] px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">MY RIGHTS</p>
            <p className="mt-1 text-sm text-black/45">Understand your rights. Prepare with clarity.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-black/55">
            <Link href="/chat" className="hover:text-black">Chat</Link>
            <Link href="/review" className="hover:text-black">Review</Link>
            <Link href="/generate" className="hover:text-black">Generate</Link>
            <Link href="/login" className="hover:text-black">Sign in</Link>
          </div>
        </div>
        <p className="mx-auto mt-7 max-w-7xl text-xs leading-5 text-black/40">
          MY RIGHTS provides legal information and preparation tools. It is not a law firm and does not constitute legal advice.
        </p>
      </footer>
    </main>
  );
}
