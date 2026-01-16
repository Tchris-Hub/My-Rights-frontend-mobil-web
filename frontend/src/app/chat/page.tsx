"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Bot, User, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Textarea } from "@/components/ui/input";
import { sendChatMessage, ChatResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: string[];
    confidenceScore?: number;
    disclaimer?: string;
    isLoading?: boolean;
    error?: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        const loadingMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "",
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await sendChatMessage(userMessage.content);

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: response.content,
                            sources: response.sources,
                            confidenceScore: response.confidence_score,
                            disclaimer: response.legal_disclaimer,
                            isLoading: false,
                        }
                        : msg
                )
            );
        } catch (error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: "Sorry, I encountered an error. Please try again.",
                            isLoading: false,
                            error: "Failed to get response",
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                {/* Chat Header */}
                <div className="border-b border-muted px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold">Legal Chat</h1>
                            <p className="text-sm text-muted-foreground">
                                Ask any legal question in plain language
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center py-12"
                        >
                            <Image
                                src="/assets/chat-empty.png"
                                alt="Start a conversation"
                                width={200}
                                height={200}
                                className="mb-6 opacity-80"
                            />
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                How can I help you today?
                            </h2>
                            <p className="text-muted-foreground max-w-md">
                                Ask me anything about Nigerian law. I can help with landlord issues, employment rights, consumer protection, and more.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                {[
                                    "What are my rights as a tenant?",
                                    "How do I write a demand letter?",
                                    "Can my employer fire me without notice?",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={cn(
                                        "flex gap-3",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot className="h-5 w-5 text-primary" />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-3",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-md"
                                                : "bg-muted text-foreground rounded-bl-md"
                                        )}
                                    >
                                        {message.isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm">Thinking...</span>
                                            </div>
                                        ) : message.error ? (
                                            <div className="flex items-center gap-2 text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{message.content}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="whitespace-pre-wrap">{message.content}</p>

                                                {/* Sources */}
                                                {message.sources && message.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                                            <BookOpen className="h-3 w-3" />
                                                            <span>Sources</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {message.sources.map((source, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs bg-background/50 px-2 py-1 rounded"
                                                                >
                                                                    {source}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Disclaimer */}
                                                {message.disclaimer && (
                                                    <p className="mt-3 text-xs text-muted-foreground italic">
                                                        {message.disclaimer}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {message.role === "user" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                            <User className="h-5 w-5 text-secondary" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-muted p-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your legal question here..."
                                className="min-h-[52px] max-h-[200px] resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "p-3 rounded-lg transition-colors",
                                input.trim() && !isLoading
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                    <p className="mt-2 text-xs text-center text-muted-foreground">
                        This is a virtual assistant. Always consult a qualified lawyer for legal advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
