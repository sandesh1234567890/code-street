import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Shield, RefreshCw, Sparkles, CheckCircle2, Filter } from 'lucide-react';
import AIFixModal from '../components/AIFixModal';
import { useAuth } from '../context/AuthContext';

const Issues = () => {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const { token, user } = useAuth();
    const canManageIssues = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/issues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch issues');
            const data = await response.json();
            setIssues(data);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (id: string) => {
        setModalOpen(true);
        setAnalyzing(true);
        setAnalysis(""); // Reset analysis
        try {
            const response = await fetch(`http://localhost:8081/api/issues/${id}/analyze`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err) {
            setAnalysis("Failed to perform AI Analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await fetch(`http://localhost:8081/api/issues/${id}/resolve`, { 
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchIssues();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) fetchIssues();
    }, [token]);

    return (
        <div className="flex-1 flex overflow-hidden relative">
            {/* Facet Sidebar */}
            <aside className="w-72 glass border-r border-white/5 p-6 space-y-8 overflow-y-auto hidden lg:block shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Issue Facets</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Status</p>
                        <div className="space-y-2">
                            {['All', 'Open', 'Resolved'].map(s => (
                                <button 
                                    key={s}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                                        s === 'All' ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                                >
                                    <span>{s} Issues</span>
                                    <span className="text-[9px] opacity-40">12</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Priority</p>
                        <div className="space-y-2 text-[11px] font-bold text-slate-400">
                            <div className="flex items-center gap-2 px-3 py-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> High Impact
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Medium
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* main Feed */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020617] overflow-y-auto p-8">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-white">Error Engine</h2>
                        <p className="text-slate-500 font-medium mt-1 tracking-tight">Real-time aggregate fingerprinting & AI diagnostics</p>
                    </div>
                    <button onClick={fetchIssues} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                <div className="space-y-4">
                    <AnimatePresence>
                        {issues.map((issue: any, idx) => (
                            <motion.div
                                key={issue.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass p-6 rounded-2xl border-glow relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                        issue.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center shrink-0">
                                        <AlertCircle className={`w-6 h-6 ${issue.status === 'RESOLVED' ? 'text-emerald-500' : 'text-rose-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-white tracking-tight mb-2 truncate group-hover:text-indigo-400 transition-colors leading-tight">{issue.title}</h3>
                                        <p className="text-xs text-slate-500 font-mono line-clamp-2 mb-4 bg-slate-950/30 p-3 rounded-xl border border-white/5">{issue.description}</p>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seen {new Date(issue.lastSeen).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5 text-slate-600" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{issue.project?.name || 'Internal'}</span>
                                            </div>
                                            {canManageIssues && (
                                                <div className="ml-auto flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleAnalyze(issue.id)}
                                                        className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border border-indigo-500/20"
                                                    >
                                                        <Sparkles className="w-3 h-3" /> Diagnostics
                                                    </button>
                                                    {issue.status === 'OPEN' && (
                                                        <button 
                                                            onClick={() => handleResolve(issue.id)}
                                                            className="px-4 py-2 glass hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border-glow"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" /> Resolve
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <AIFixModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    analysis={analysis} 
                    loading={analyzing} 
                />
            </main>
        </div>
    );
};

export default Issues;
