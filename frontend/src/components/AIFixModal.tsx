import React from 'react';
import { X, Sparkles, Copy, Check, MessageSquareCode } from 'lucide-react';

const AIFixModal = ({ isOpen, onClose, analysis, loading }: any) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(analysis);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-card/50 shadow-2xl backdrop-blur-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">AI Diagnostic Solution</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium animate-pulse">Analyzing stack trace and generating fix...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5">
                            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 flex items-start gap-4">
                                <MessageSquareCode className="w-6 h-6 text-primary shrink-0" />
                                <p className="text-sm leading-relaxed italic text-primary/90 m-0">
                                    "I've analyzed the error fingerprint and normalized stack trace. Below is the root cause and a proposed code-level fix."
                                </p>
                            </div>
                            
                            {/* Simple Markdown-ish Rendering (demo version) */}
                            <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-muted-foreground">
                                {analysis}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && (
                    <div className="p-6 border-t border-white/10 bg-secondary/20 flex justify-between items-center">
                        <p className="text-[10px] text-muted-foreground italic">
                            * AI suggestions may require further verification for production environments.
                        </p>
                        <button 
                            onClick={copyToClipboard}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
                            }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Proposed Fix'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIFixModal;
