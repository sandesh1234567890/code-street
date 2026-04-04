import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Shield, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import AIFixModal from '../components/AIFixModal';

const Issues = () => {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // AI Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [analyzing, setAnalyzing] = useState(false);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/issues');
            if (!response.ok) throw new Error('Failed to fetch issues');
            const data = await response.json();
            setIssues(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (id: string) => {
        setModalOpen(true);
        setAnalyzing(true);
        try {
            const response = await fetch(`http://localhost:8080/api/issues/${id}/analyze`);
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err) {
            setAnalysis("Failed to perform AI Analysis. Make sure your GEMINI_API_KEY is valid.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await fetch(`http://localhost:8080/api/issues/${id}/resolve`, { method: 'POST' });
            fetchIssues();
        } catch (err) {
            console.error("Failed to resolve issue:", err);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-rose-500" /> Active Issues
                    </h2>
                    <p className="text-muted-foreground mt-1">Aggregated errors grouped by stack trace fingerprint.</p>
                </div>
                <button 
                    onClick={fetchIssues}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm border border-border hover:bg-secondary/80"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {loading && <div className="text-center py-20 text-muted-foreground">Loading issues...</div>}
                {!loading && issues.length === 0 && !error && <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-dashed border-border">No active issues found. Your system is healthy!</div>}
                {issues.map((issue) => (
                    <div key={issue.id} className={`p-6 rounded-xl border transition-all group ${
                        issue.status === 'RESOLVED' ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-card border-border hover:border-primary/50'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 text-xs font-medium uppercase tracking-wider">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                        issue.level === 'FATAL' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                        {issue.level}
                                    </span>
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> {issue.project?.name}
                                    </span>
                                    {issue.status === 'RESOLVED' ? (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Resolved
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Last seen {new Date(issue.lastSeen).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                                <h3 className={`text-lg font-bold mb-2 break-all ${issue.status === 'RESOLVED' ? 'line-through text-muted-foreground' : ''}`}>
                                    {issue.title}
                                </h3>
                                <p className="text-sm text-muted-foreground font-mono bg-slate-900/50 p-2 rounded border border-slate-800">
                                    {issue.fingerprint}
                                </p>
                                
                                <div className="flex items-center gap-3 mt-4">
                                    <button 
                                        onClick={() => handleAnalyze(issue.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-600/30 transition-all active:scale-95"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" /> AI Analysis
                                    </button>
                                    {issue.status === 'OPEN' && (
                                        <button 
                                            onClick={() => handleResolve(issue.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-all active:scale-95"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-right ml-6">
                                <div className={`text-2xl font-black ${issue.status === 'RESOLVED' ? 'text-muted-foreground' : 'text-primary'}`}>
                                    {issue.occurrenceCount}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Events</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AIFixModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                analysis={analysis} 
                loading={analyzing} 
            />
        </div>
    );
};

export default Issues;
