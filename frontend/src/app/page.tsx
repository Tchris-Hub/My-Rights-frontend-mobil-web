"use client";

import { motion } from "framer-motion";
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
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const APP_ASSET = "/app-assets";
const ONBOARDING = APP_ASSET;

const sections = [
  {
    number: "01",
    eyebrow: "UNDERSTAND",
    title: "Start with the question.",
    copy:
      "Legal problems rarely arrive as neat legal questions. They arrive as a landlord's message, an employment disagreement, a family matter, a payment issue, or something you simply do not know how to interpret.",
    detail:
      "MY RIGHTS lets you ask in ordinary language and explore the Nigerian legal context around the situation.",
    icon: MessageSquare,
    image: `${ONBOARDING}/rights.png`,
    alt: "MY RIGHTS onboarding artwork about rights",
  },
  {
    number: "02",
    eyebrow: "READ",
    title: "Understand the document before you act.",
    copy:
      "Important terms can be buried in pages of legal language. Document Review helps bring important clauses, obligations and areas that deserve attention into clearer view.",
    detail:
      "Upload a document in the app and use the review experience to understand what you are looking at before deciding what comes next.",
    icon: FileSearch,
    image: `${ONBOARDING}/precision.png`,
    alt: "MY RIGHTS onboarding artwork about precision",
  },
  {
    number: "03",
    eyebrow: "PREPARE",
    title: "Turn your facts into something useful.",
    copy:
      "Sometimes the difficult part is putting your situation into words, organising the facts and preparing the document you need.",
    detail:
      "Document Generation helps structure common legal documents from the information you provide, while keeping professional legal judgment where it belongs.",
    icon: FileText,
    image: `${ONBOARDING}/justice.png`,
    alt: "MY RIGHTS onboarding artwork about justice",
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AppMark() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={`${APP_ASSET}/icon.png`}
        alt="MY RIGHTS application icon"
        className="h-11 w-11 rounded-[12px] object-cover shadow-sm"
      />
      <div>
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#0B1326]">
          MY RIGHTS
        </p>
        <p className="text-xs text-[#44474E]">Legal information, in your pocket.</p>
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="absolute -left-8 top-16 hidden h-20 w-20 rounded-full border border-[#047857]/15 bg-[#ECFDF5] lg:block" />
      <div className="absolute -right-7 bottom-20 hidden h-28 w-28 rounded-full border border-[#E9C349]/30 bg-[#FFFDF2] lg:block" />

      <div className="relative mx-auto w-[270px] rounded-[38px] border-[7px] border-[#0B1326] bg-[#0B1326] p-2 shadow-[0_28px_70px_rgba(11,19,38,0.22)] sm:w-[300px]">
        <div className="relative aspect-[9/18.5] overflow-hidden rounded-[29px] bg-white">
          <img
            src={`${ONBOARDING}/rights.png`}
            alt="MY RIGHTS mobile application artwork"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-[18px] bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <img
                src={`${APP_ASSET}/icon.png`}
                alt=""
                className="h-9 w-9 rounded-[10px]"
              />
              <div>
                <p className="text-sm font-bold text-[#191C1E]">MY RIGHTS</p>
                <p className="text-[11px] text-[#44474E]">Know what matters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#047857]/15 bg-white px-4 py-2 text-xs font-semibold text-[#047857] shadow-lg">
        <span className="h-2 w-2 rounded-full bg-[#047857]" />
        Built for everyday Nigeria
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#191C1E]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <AppMark />
          <a
            href="#download"
            className="hidden rounded-full bg-[#047857] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#059669] sm:inline-flex"
          >
            Download the app
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white px-6 pb-24 pt-32 lg:min-h-screen lg:px-10 lg:pb-20 lg:pt-36">
        <div className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full border border-[#047857]/10 bg-[#ECFDF5] sm:h-[420px] sm:w-[420px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-[#F8F9FA]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#047857]/15 bg-[#ECFDF5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#047857]">
                <Sparkles className="h-3.5 w-3.5" />
                Know what matters
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-jakarta)] text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#0B1326] sm:text-6xl lg:text-[5.7rem]">
                Understand your rights.
                <span className="block text-[#047857]">Prepare with clarity.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#44474E] sm:text-xl">
                MY RIGHTS is a mobile legal-information application for everyday life in Nigeria.
                Ask questions, understand documents, prepare what you need, and know when it is
                time to involve a human professional.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#explore"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#047857] px-7 py-4 font-semibold text-white shadow-lg shadow-[#047857]/15 transition hover:-translate-y-1 hover:bg-[#059669]"
                >
                  Explore the app
                  <ArrowDown className="h-5 w-5" />
                </a>
                <a
                  href="#purpose"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-[#C4C7CF] bg-white px-7 py-4 font-semibold text-[#0B1326] transition hover:border-[#047857]/40 hover:bg-[#ECFDF5]"
                >
                  Why MY RIGHTS
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex items-center gap-4 text-sm text-[#44474E]">
                <span className="h-px w-10 bg-[#E9C349]" />
                Legal information and preparation tools, not a replacement for professional legal advice.
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:pt-8">
            <PhonePreview />
          </Reveal>
        </div>

        <a
          href="#purpose"
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-[#047857] sm:block"
          aria-label="Scroll to purpose"
        >
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      <section id="purpose" className="bg-[#F8F9FA] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.78fr_1.22fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">Why it exists</p>
            <h2 className="mt-5 max-w-xl font-[family-name:var(--font-jakarta)] text-4xl font-bold leading-tight tracking-[-0.045em] text-[#0B1326] sm:text-5xl">
              Legal information should feel approachable before a problem becomes a crisis.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="max-w-3xl space-y-6 text-lg leading-8 text-[#44474E]">
              <p>
                Most people do not begin with legal vocabulary. They begin with a situation:
                something they were asked to sign, a disagreement at work, a tenancy problem, a
                payment that went wrong, or a letter they do not fully understand.
              </p>
              <p>
                MY RIGHTS puts a clearer first step in the palm of your hand. The app brings legal
                questions, document understanding and document preparation into one experience
                designed around ordinary people.
              </p>
              <div className="grid gap-4 pt-3 sm:grid-cols-2">
                {[
                  ["Plain-language questions", MessageSquare],
                  ["Nigerian legal context", Landmark],
                  ["Document understanding", BookOpen],
                  ["Preparation before action", ShieldCheck],
                ].map(([label, Icon]) => (
                  <div
                    key={label as string}
                    className="flex items-center gap-4 rounded-[16px] border border-[#C4C7CF]/70 bg-white p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#ECFDF5] text-[#047857]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-[#191C1E]">{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="explore" className="bg-white px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">Inside the app</p>
            <h2 className="mt-5 max-w-4xl font-[family-name:var(--font-jakarta)] text-4xl font-bold tracking-[-0.045em] text-[#0B1326] sm:text-5xl">
              One mobile experience. Three important ways to move forward.
            </h2>
          </Reveal>

          <div className="mt-20 space-y-24">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const reverse = index % 2 === 1;

              return (
                <div key={section.number} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
                  <Reveal className={reverse ? "lg:order-2" : ""}>
                    <div className="relative overflow-hidden rounded-[24px] border border-[#C4C7CF]/70 bg-[#F8F9FA] p-3 shadow-sm">
                      <div className="relative overflow-hidden rounded-[18px] bg-white">
                        <img
                          src={section.image}
                          alt={section.alt}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-[16px] bg-white/95 px-4 py-3 shadow-lg">
                          <img
                            src={`${APP_ASSET}/icon.png`}
                            alt=""
                            className="h-9 w-9 rounded-[10px]"
                          />
                          <span className="text-sm font-bold text-[#191C1E]">MY RIGHTS</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.08} className={reverse ? "lg:order-1" : ""}>
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[#047857]">
                        <span>{section.number}</span>
                        <span className="h-px w-8 bg-[#E9C349]" />
                        <span>{section.eyebrow}</span>
                      </div>
                      <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#ECFDF5] text-[#047857]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-7 font-[family-name:var(--font-jakarta)] text-3xl font-bold leading-tight tracking-[-0.035em] text-[#0B1326] sm:text-4xl">
                        {section.title}
                      </h3>
                      <p className="mt-6 text-lg leading-8 text-[#44474E]">{section.copy}</p>
                      <p className="mt-6 rounded-r-[12px] border-l-2 border-[#E9C349] bg-[#FFFDF2] px-5 py-4 text-base leading-7 text-[#44474E]">
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

      <section className="bg-[#0B1326] px-6 py-24 text-white lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <div
              aria-label="Designed Around People image placeholder"
              className="min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 sm:min-h-[420px] lg:min-h-[520px]"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E9C349]">Designed around people</p>
            <h2 className="mt-5 max-w-3xl font-[family-name:var(--font-jakarta)] text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              The app meets you where the legal problem actually begins.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
              You do not need to know what a legal term is called before you can ask what it means.
              You do not need to decide that something is a case before you can understand the
              document in front of you.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                "Ask in ordinary language",
                "Understand what you are reading",
                "Prepare before taking action",
                "Know when human help matters",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/5 p-4">
                  <Check className="h-5 w-5 shrink-0 text-[#E9C349]" />
                  <span className="font-medium text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F8F9FA] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">Responsible by design</p>
            <h2 className="mt-5 max-w-3xl font-[family-name:var(--font-jakarta)] text-4xl font-bold tracking-[-0.045em] text-[#0B1326] sm:text-5xl">
              Useful technology. Clear boundaries.
            </h2>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#44474E]">
              MY RIGHTS is built to help people understand and prepare. It does not pretend that
              an AI system can replace the judgment, representation or accountability of a qualified
              legal professional.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Information", "Explore the legal context around your question.", ShieldCheck],
              ["Preparation", "Review documents and structure common documents from your facts.", FileText],
              ["Human judgment", "Recognise when a qualified professional should step in.", Gavel],
            ].map(([title, copy, Icon], index) => (
              <Reveal key={title as string} delay={index * 0.06}>
                <div className="h-full rounded-[16px] border border-[#C4C7CF]/70 bg-white p-7 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#ECFDF5] text-[#047857]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-7 font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0B1326]">
                    {title as string}
                  </h3>
                  <p className="mt-3 leading-7 text-[#44474E]">{copy as string}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">For everyday Nigeria</p>
            <h2 className="mt-5 font-[family-name:var(--font-jakarta)] text-4xl font-bold tracking-[-0.045em] text-[#0B1326] sm:text-5xl">
              The moments when understanding matters.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#44474E]">
              Housing. Work. Agreements. Payments. Personal matters. Everyday situations can carry
              legal consequences long before they look like a legal case.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Tenancy & housing",
                "Employment matters",
                "Contracts & agreements",
                "Letters & notices",
                "Personal legal questions",
                "Preparing for counsel",
              ].map((item) => (
                <div key={item} className="rounded-[16px] border border-[#C4C7CF]/70 bg-[#F8F9FA] p-5 sm:p-7">
                  <Check className="h-5 w-5 text-[#047857]" />
                  <p className="mt-5 font-semibold leading-6 text-[#191C1E]">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="download" className="bg-[#047857] px-6 py-24 text-white lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E9C349]">Take MY RIGHTS with you</p>
            <h2 className="mt-5 max-w-4xl font-[family-name:var(--font-jakarta)] text-5xl font-bold leading-[1] tracking-[-0.05em] sm:text-6xl">
              Your next question deserves a clearer beginning.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
              Download the MY RIGHTS Android application and keep legal information, document
              understanding and preparation tools within reach.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-7 backdrop-blur">
              <img
                src={`${APP_ASSET}/icon.png`}
                alt="MY RIGHTS application icon"
                className="mx-auto h-20 w-20 rounded-[22px] shadow-xl"
              />
              <a
                href={process.env.NEXT_PUBLIC_APK_URL || "#download"}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-[#047857] transition hover:-translate-y-1"
              >
                Download APK
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="mt-3 text-center text-xs text-white/55">Android application</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#0B1326] px-6 py-10 text-white lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${APP_ASSET}/icon.png`}
              alt=""
              className="h-9 w-9 rounded-[10px]"
            />
            <div>
              <p className="font-[family-name:var(--font-jakarta)] font-bold">MY RIGHTS</p>
              <p className="text-xs text-white/45">Understand your rights. Prepare with clarity.</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-5 text-white/45 sm:text-right">
            MY RIGHTS provides legal information and preparation tools. It is not a law firm and
            does not constitute legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
