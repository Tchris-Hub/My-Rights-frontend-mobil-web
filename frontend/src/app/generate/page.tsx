"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Loader2, Copy, Check, AlertTriangle, Download } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { generateDocument, DocumentGenerationResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const documentTypes = [
    { value: "demand_letter", label: "Demand Letter" },
    { value: "tenancy_agreement", label: "Tenancy Agreement" },
    { value: "employment_contract", label: "Employment Contract" },
    { value: "loan_agreement", label: "Loan Agreement" },
    { value: "receipt", label: "Receipt / Acknowledgement" },
    { value: "power_of_attorney", label: "Power of Attorney" },
];

export default function GeneratePage() {
    const [docType, setDocType] = useState("");
    const [userDetails, setUserDetails] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<DocumentGenerationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!docType || !userDetails.trim()) return;

        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateDocument(docType, userDetails);
            setResult(response);
        } catch (err) {
            setError("Failed to generate document. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(result.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([result.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.doc_type.replace(/\s+/g, "_")}_template.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                        <h1 className="text-2xl font-bold">Document Generator</h1>
                        <p className="text-muted-foreground">
                            Create professional legal document templates
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Document Details
                                </CardTitle>
                                <CardDescription>
                                    Select the type of document and provide the necessary details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Document Type Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Document Type
                                    </label>
                                    <select
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-muted bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    >
                                        <option value="">Select document type...</option>
                                        {documentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* User Details */}
                                <Textarea
                                    label="Your Details"
                                    value={userDetails}
                                    onChange={(e) => setUserDetails(e.target.value)}
                                    placeholder={`Provide the details needed for your ${docType ? documentTypes.find(t => t.value === docType)?.label : 'document'}...\n\nFor example:\n- Your full name\n- Other party's name\n- Date\n- Amount (if applicable)\n- Address\n- Specific terms or conditions`}
                                    className="min-h-[250px]"
                                />

                                <button
                                    onClick={handleGenerate}
                                    disabled={!docType || !userDetails.trim() || isGenerating}
                                    className={cn(
                                        "w-full py-3 rounded-lg font-medium transition-all",
                                        docType && userDetails.trim() && !isGenerating
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        "Generate Template"
                                    )}
                                </button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        {!result && !isGenerating && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center py-12"
                            >
                                <FileText className="h-20 w-20 text-muted-foreground/30 mb-6" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Ready to Generate
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Select a document type, provide your details, and click "Generate Template" to create your document.
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
                                {/* Warning Banner */}
                                <Card className="border-amber-200 bg-amber-50">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-amber-800">Template Only</p>
                                                <p className="text-amber-700">{result.warning}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Generated Document */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{result.doc_type}</CardTitle>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCopy}
                                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    {copied ? (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleDownload}
                                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                    title="Download as text file"
                                                >
                                                    <Download className="h-5 w-5 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto max-h-[500px] overflow-y-auto">
                                            {result.content}
                                        </pre>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
