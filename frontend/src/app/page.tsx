"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, FileSearch, FileText, ArrowRight, Shield, Users, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Smart Legal Chat",
    description: "Ask legal questions in plain language and get clear, helpful answers with references to Nigerian law.",
    href: "/chat",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: FileSearch,
    title: "Document Review",
    description: "Upload contracts and agreements to identify risky clauses and get recommendations before you sign.",
    href: "/review",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: FileText,
    title: "Document Generator",
    description: "Create professional legal templates for common needs like demand letters and agreements.",
    href: "/generate",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Know Your Rights",
    description: "Understand Nigerian law in simple terms",
  },
  {
    icon: Users,
    title: "Accessible to All",
    description: "No legal jargon, just clear answers",
  },
  {
    icon: Clock,
    title: "Available 24/7",
    description: "Get legal guidance anytime you need it",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Digital Legal Companion.{" "}
                <span className="text-primary">Know Your Rights.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Empowering Nigerians with accessible legal information. Get instant answers to your legal questions, review contracts, and generate documents.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Free Consultation
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <Image
                  src="/assets/hero.png"
                  alt="Digital Legal Assistance Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-accent to-transparent opacity-50 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent opacity-50 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How My Rights Can Help You
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful tools to navigate Nigerian law with confidence
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Link href={feature.href}>
                    <Card className="group h-full hover:border-primary/50 cursor-pointer">
                      <CardHeader>
                        <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                          <Icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Try it now <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose My Rights?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for everyday Nigerians who deserve access to legal knowledge
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Know Your Rights?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Start your free consultation now. No sign-up required for basic queries.
            </p>
            <div className="mt-8">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium bg-white text-primary rounded-lg hover:bg-white/90 transition-all shadow-lg"
              >
                Start Free Consultation
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-muted bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo.png"
                alt="My Rights Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-foreground">My Rights</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} My Rights. This is a digital assistant and does not constitute legal advice.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
