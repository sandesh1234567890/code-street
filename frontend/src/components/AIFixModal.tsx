import { useState } from 'react';
import { X, Sparkles, Check, Terminal as TerminalIcon, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AIFixModal = ({ isOpen, onClose, analysis, loading }: any) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(analysis);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-500">
            {/* Cinematic Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl flex flex-col border-glow"
            >
                {/* Header: OS Window Style */}
                <div className="flex items-center justify-between p-6 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <div className="flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Sentinel-v4.0 // Diagnostic Report</h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Report Body */}
                <div className="flex-1 overflow-y-auto p-10 font-mono text-sm leading-relaxed custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <Activity className="w-12 h-12 text-indigo-500 animate-pulse" />
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-xs">Initializing Neural Link...</p>
                                <div className="flex gap-1 justify-center">
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-indigo-500" />
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-500" />
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                <ShieldAlert className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                                <div>
                                    <p className="text-indigo-300 font-black uppercase tracking-widest text-[10px] mb-1">Impact Analysis</p>
                                    <p className="text-slate-400 leading-relaxed italic">
                                        Heuristic scan complete. Gemini LLM detects a critical logic regression in the core event loop. Proposed patch below targets the specific memory footprint observed in trace.
                                    </p>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur opacity-25 group-hover:opacity-50 transition-opacity" />
                                <div className="relative bg-slate-950/80 p-8 rounded-2xl border border-white/5 font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-loose">
                                    {analysis}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cinematic Footer */}
                {!loading && (
                    <div className="p-8 bg-white/5 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sys: Normal</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10" />
                            <span className="text-[10px] font-mono text-slate-600">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>
                        
                        <button 
                            onClick={copyToClipboard}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                copied 
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' 
                                : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 active:scale-95'
                            }`}
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                            {copied ? 'Copied to Clipboard' : 'Execute Fix Logic'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AIFixModal;
