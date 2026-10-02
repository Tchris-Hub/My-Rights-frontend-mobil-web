"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  FileSearch,
  FileText,
  Gavel,
  Landmark,
  MessageSquare,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

const sections = [
  {
    number: "01",
    eyebrow: "UNDERSTAND",
    title: "Start with the question.",
    copy:
      "Legal problems rarely arrive as neat legal questions. They arrive as a message from a landlord, a contract placed in front of you, an employment disagreement, a family matter, or a situation you simply do not know how to interpret.",
    detail:
      "MY RIGHTS gives you a place to start. Ask questions in ordinary language and explore the Nigerian legal context around your situation.",
    icon: MessageSquare,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85",
    alt: "People discussing a matter together",
  },
  {
    number: "02",
    eyebrow: "READ",
    title: "Understand the document before you act.",
    copy:
      "Important terms are often buried in pages of legal language. A document can look ordinary while containing obligations, deadlines, restrictions or clauses you should understand before signing.",
    detail:
      "With Document Review, MY RIGHTS helps explain important parts of a document and brings areas that deserve attention into clearer view.",
    icon: FileSearch,
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85",
    alt: "Contract and paperwork on a desk",
  },
  {
    number: "03",
    eyebrow: "PREPARE",
    title: "Turn your facts into something useful.",
    copy:
      "Sometimes the hardest part is not knowing the law. It is knowing how to put your situation into words, organise the facts and prepare the document you need.",
    detail:
      "Document Generation helps structure common legal documents from the information you provide, while keeping the boundary clear: preparation is not a substitute for professional legal advice.",
    icon: FileText,
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1800&q=85",
    alt: "Law books and documents",
  },
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScalesIllustration() {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" aria-hidden="true">
      <circle cx="250" cy="250" r="190" fill="#F1F3F5" />
      <circle cx="250" cy="250" r="154" fill="#FFFFFF" stroke="#002244" strokeWidth="3" />
      <path d="M250 105v260" stroke="#002244" strokeWidth="7" strokeLinecap="round" />
      <path d="M145 170h210" stroke="#002244" strokeWidth="7" strokeLinecap="round" />
      <path d="M145 170l-42 95h84l-42-95Z" fill="#F8F8F6" stroke="#002244" strokeWidth="6" />
      <path d="M355 170l-42 95h84l-42-95Z" fill="#F8F8F6" stroke="#002244" strokeWidth="6" />
      <path d="M101 266h88M311 266h88" stroke="#D4AF37" strokeWidth="9" strokeLinecap="round" />
      <path d="M202 365h96" stroke="#002244" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIllustration() {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" aria-hidden="true">
      <rect x="112" y="58" width="276" height="360" rx="22" fill="#FFFFFF" stroke="#002244" strokeWidth="6" />
      <path d="M302 58v86h86" fill="#F1F3F5" stroke="#002244" strokeWidth="6" />
      <path d="M152 190h160M152 226h196M152 262h174" stroke="#9AA5AE" strokeWidth="10" strokeLinecap="round" />
      <rect x="152" y="305" width="136" height="58" rx="15" fill="#D4AF37" />
      <path d="M181 335l20 20 46-52" stroke="#002244" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIllustration() {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" aria-hidden="true">
      <circle cx="250" cy="250" r="190" fill="#E8EDF1" />
      <circle cx="250" cy="160" r="45" fill="#FFFFFF" stroke="#002244" strokeWidth="6" />
      <path d="M170 352c10-67 41-99 80-99s70 32 80 99" fill="#002244" />
      <circle cx="128" cy="222" r="34" fill="#FFFFFF" stroke="#002244" strokeWidth="5" />
      <path d="M75 374c8-58 29-83 53-83 22 0 43 25 51 83" fill="#D4AF37" />
      <circle cx="372" cy="222" r="34" fill="#FFFFFF" stroke="#002244" strokeWidth="5" />
      <path d="M321 374c8-58 29-83 51-83 24 0 45 25 53 83" fill="#D4AF37" />
      <path d="M193 405h114" stroke="#002244" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroMarkY = useTransform(scrollYProgress, [0, 0.25], [0, 90]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F8F6] text-[#002244]">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#002244] text-white">
        <motion.div style={{ y: heroMarkY }} className="pointer-events-none absolute -right-36 top-24 hidden h-[520px] w-[520px] lg:block">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-12 rounded-full border border-[#D4AF37]/20" />
          <div className="absolute inset-28 rounded-full border border-white/10" />
        </motion.div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.12fr_.88fr] lg:px-10">
          <div>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
                MY RIGHTS
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-[6.4rem]">
                Understand the law.
                <span className="block text-[#D4AF37]">Know your next step.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                MY RIGHTS is a mobile legal-information application built for everyday life in
                Nigeria—helping people understand their rights, make sense of legal documents,
                prepare with clarity, and know when a human professional should step in.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-7 py-4 font-semibold text-[#002244] transition-transform hover:-translate-y-1"
                >
                  Explore MY RIGHTS
                  <ArrowDown className="h-5 w-5" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
                >
                  Our purpose
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <p className="mt-10 max-w-xl border-l border-[#D4AF37] pl-5 text-sm leading-6 text-white/55">
                Legal information and preparation tools—not a replacement for a qualified legal
                professional.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="relative mx-auto w-full max-w-[500px]">
            <div className="relative aspect-square">
              <ScalesIllustration />
              <div className="absolute bottom-7 left-1/2 w-[240px] -translate-x-1/2 border border-[#002244]/10 bg-[#F8F8F6] p-5 text-[#002244] shadow-2xl sm:w-[280px]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C6D17]">
                  A clearer beginning
                </p>
                <p className="mt-3 text-xl font-semibold leading-7">
                  Know what matters before you decide what to do.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <a href="#about" className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/45 transition hover:text-white">
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      <section id="about" className="border-b border-[#002244]/10 bg-[#F8F8F6] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C6D17]">About</p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              Legal literacy should begin before the crisis.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="max-w-3xl text-lg leading-9 text-[#002244]/65">
              <p>
                Most people do not wake up looking for a lawyer. They encounter a problem first:
                a document they do not understand, a promise that was not kept, a disagreement
                over work or housing, a letter that suddenly changes the stakes.
              </p>
              <p className="mt-7">
                MY RIGHTS exists to make that first moment less intimidating. It brings legal
                information, document understanding and practical preparation into one mobile
                experience designed around the questions people actually have.
              </p>
              <p className="mt-7">
                The goal is not to turn everyone into a lawyer. The goal is to help more people
                recognise when something matters, understand what is in front of them, and take
                the next responsible step.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C6D17]">What MY RIGHTS brings together</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              One place to move from uncertainty to preparation.
            </h2>
          </Reveal>

          <div className="mt-20 space-y-28">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const reverse = index % 2 === 1;
              return (
                <div key={section.id} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                  <Reveal className={reverse ? "lg:order-2" : ""}>
                    <div className="overflow-hidden border border-[#002244]/10 bg-[#F8F8F6]">
                      <img
                        src={section.image}
                        alt={section.alt}
                        className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.025]"
                      />
                    </div>
                  </Reveal>

                  <Reveal delay={0.08} className={reverse ? "lg:order-1" : ""}>
                    <div className="max-w-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold tracking-[0.2em] text-[#8C6D17]">{section.number}</span>
                        <span className="h-px w-10 bg-[#D4AF37]" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6D17]">{section.eyebrow}</span>
                      </div>
                      <div className="mt-7 flex h-12 w-12 items-center justify-center border border-[#002244]/15 bg-[#F8F8F6]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-7 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                        {section.title}
                      </h3>
                      <p className="mt-6 text-lg leading-8 text-[#002244]/62">{section.copy}</p>
                      <p className="mt-5 border-l-2 border-[#D4AF37] pl-5 text-base leading-7 text-[#002244]/70">
                        {section.detail}
                      </p>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F1F3F5] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C6D17]">Designed around people</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Technology should make legal information easier to approach.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#002244]/65">
              MY RIGHTS is designed for people who may not know the legal vocabulary, may not know
              where to begin, or may simply need help understanding what a situation means before
              deciding what to do next.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ["Plain-language questions", MessageSquare],
                ["Nigerian legal context", Landmark],
                ["Document understanding", BookOpen],
                ["Preparation before action", Scale],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center gap-4 border border-[#002244]/10 bg-white p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#002244] text-[#D4AF37]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{label as string}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto w-full max-w-[460px]">
            <PeopleIllustration />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#002244] px-6 py-24 text-white lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal className="mx-auto w-full max-w-[450px]">
            <DocumentIllustration />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D4AF37]">The impact</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Better understanding can change what happens next.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-white/68">
              <p>
                When people understand the document in front of them, they can ask better questions.
                When they understand the issue, they can prepare better for a conversation with a
                professional.
              </p>
              <p>
                That is the larger purpose of MY RIGHTS: helping legal information become something
                people can approach earlier, understand more clearly and use more responsibly.
              </p>
            </div>

            <div className="mt-10 border-t border-white/15 pt-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">The principle</p>
              <p className="mt-4 text-2xl font-medium leading-9">
                Give people enough clarity to take the next responsible step.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F8F8F6] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C6D17]">Built with boundaries</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Useful technology. Responsible expectations.
              </h2>
              <p className="mt-7 text-lg leading-8 text-[#002244]/65">
                MY RIGHTS is a legal-information and preparation tool. It is designed to help you
                understand and prepare—not to pretend that an AI system can replace a qualified
                legal professional when professional judgment is required.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Information", "Explore legal context and understand the issue before making decisions.", ShieldCheck],
              ["Preparation", "Review documents and structure common documents from the facts you provide.", FileText],
              ["Human judgment", "Know when a situation calls for a qualified legal professional.", Gavel],
            ].map(([title, copy, Icon], index) => (
              <Reveal key={title as string} delay={index * 0.06}>
                <div className="h-full border border-[#002244]/10 bg-white p-7">
                  <Icon className="h-6 w-6 text-[#8C6D17]" />
                  <h3 className="mt-8 text-xl font-semibold">{title as string}</h3>
                  <p className="mt-3 leading-7 text-[#002244]/58">{copy as string}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C6D17]">For everyday Nigeria</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              The moments when understanding matters.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#002244]/65">
              Housing. Work. Agreements. Payments. Personal matters. Everyday situations can carry
              legal consequences long before they look like a legal case.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-px border border-[#002244]/10 bg-[#002244]/10">
              {[
                "Tenancy & housing",
                "Employment matters",
                "Contracts & agreements",
                "Letters & notices",
                "Personal legal questions",
                "Preparing for counsel",
              ].map((item) => (
                <div key={item} className="bg-[#F8F8F6] p-6 sm:p-8">
                  <Check className="h-5 w-5 text-[#8C6D17]" />
                  <p className="mt-5 font-semibold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="download" className="bg-[#D4AF37] px-6 py-24 text-[#002244] lg:px-10 lg:py-36">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#002244]/55">Take MY RIGHTS with you</p>
            <h2 className="mt-5 text-5xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Understanding your rights should be closer than your next question.
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#002244]/65">
              Download the MY RIGHTS Android application and keep legal information, document
              understanding and preparation tools within reach.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={process.env.NEXT_PUBLIC_APK_URL || "#download"}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#002244] px-8 py-4 font-semibold text-white transition-transform hover:-translate-y-1"
              >
                Download APK
                <ArrowRight className="h-5 w-5" />
              </a>
              <span className="text-sm text-[#002244]/50">
                Android application
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#002244] px-6 py-12 text-white lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xl font-semibold tracking-[-0.03em]">MY RIGHTS</p>
            <p className="mt-2 text-sm text-white/45">
              Understand your rights. Prepare with clarity.
            </p>
          </div>
          <p className="max-w-md text-xs leading-5 text-white/40 sm:text-right">
            MY RIGHTS provides legal information and preparation tools. It is not a law firm and
            does not constitute legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
