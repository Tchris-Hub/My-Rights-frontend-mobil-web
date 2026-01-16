"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileSearch, Loader2, AlertTriangle, CheckCircle, XCircle, Shield } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { analyzeDocument, DocumentAnalysisResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
    const [documentText, setDocumentText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DocumentAnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!documentText.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await analyzeDocument(documentText);
            setResult(response);
        } catch (err) {
            setError("Failed to analyze document. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getVerdictConfig = (verdict: string) => {
        switch (verdict) {
            case "Safe":
                return {
                    icon: CheckCircle,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                };
            case "Caution":
                return {
                    icon: AlertTriangle,
                    color: "text-amber-600",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-200",
                };
            case "Do Not Sign":
                return {
                    icon: XCircle,
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            default:
                return {
                    icon: Shield,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
        }
    };

    const getRiskColor = (score: number) => {
        if (score <= 30) return "bg-green-500";
        if (score <= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        href="/"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Document Review</h1>
                        <p className="text-muted-foreground">
                            Paste your contract or agreement to analyze for risky clauses
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSearch className="h-5 w-5 text-primary" />
                                    Paste Document Text
                                </CardTitle>
                                <CardDescription>
                                    Copy and paste the full text of your contract or agreement below
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={documentText}
                                    onChange={(e) => setDocumentText(e.target.value)}
                                    placeholder="Paste your contract or agreement here..."
                                    className="min-h-[400px] font-mono text-sm"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!documentText.trim() || isAnalyzing}
                                    className={cn(
                                        "mt-4 w-full py-3 rounded-lg font-medium transition-all",
                                        documentText.trim() && !isAnalyzing
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {isAnalyzing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Analyzing...
                                        </span>
                                    ) : (
                                        "Analyze Contract"
                                    )}
                                </button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        {!result && !isAnalyzing && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center py-12"
                            >
                                <Image
                                    src="/assets/review-empty.png"
                                    alt="Document review"
                                    width={180}
                                    height={180}
                                    className="mb-6 opacity-70"
                                />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Ready to Review
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Paste your document on the left and click "Analyze Contract" to get a detailed risk assessment.
                                </p>
                            </motion.div>
                        )}

                        {error && (
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="py-6">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <AlertTriangle className="h-6 w-6" />
                                        <p>{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Verdict Card */}
                                {(() => {
                                    const config = getVerdictConfig(result.verdict);
                                    const VerdictIcon = config.icon;
                                    return (
                                        <Card className={cn("border-2", config.borderColor, config.bgColor)}>
                                            <CardContent className="py-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <VerdictIcon className={cn("h-8 w-8", config.color)} />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Verdict</p>
                                                            <p className={cn("text-2xl font-bold", config.color)}>
                                                                {result.verdict}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Risk Score */}
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all", getRiskColor(result.risk_score))}
                                                                    style={{ width: `${result.risk_score}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-bold">{result.risk_score}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}

                                {/* Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{result.summary}</p>
                                    </CardContent>
                                </Card>

                                {/* Dangerous Clauses */}
                                {result.dangerous_clauses && result.dangerous_clauses.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-red-600">
                                                ⚠️ Dangerous Clauses Found
                                            </CardTitle>
                                            <CardDescription>
                                                These clauses may be unfavorable to you
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {result.dangerous_clauses.map((clause, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg bg-red-50 border border-red-100"
                                                >
                                                    <p className="font-medium text-foreground mb-2">
                                                        "{clause.clause}"
                                                    </p>
                                                    <div className="space-y-2 text-sm">
                                                        <p>
                                                            <span className="font-medium text-red-600">Risk Level:</span>{" "}
                                                            {clause.risk_level}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Why it's risky:</span>{" "}
                                                            {clause.explanation}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium text-green-600">Recommendation:</span>{" "}
                                                            {clause.recommendation}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Disclaimer */}
                                <p className="text-xs text-muted-foreground text-center italic">
                                    {result.legal_disclaimer}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
