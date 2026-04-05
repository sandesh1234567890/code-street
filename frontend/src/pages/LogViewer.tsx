import { useState, useEffect } from 'react';
import { Search, ArrowRight, RefreshCw, Filter, Activity, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LogViewer = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('ALL');
    const [environment, setEnvironment] = useState('production');
    const [subModuleId] = useState('');
    const { token } = useAuth();

    const fetchLogs = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const url = new URL('http://localhost:8081/api/logs');
            if (level !== 'ALL') url.searchParams.append('level', level);
            if (search) url.searchParams.append('search', search);

            const response = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            
            // Client-side filtering for SubModule (In real app, this is backend-side)
            const filtered = data.filter((l: any) => {
                const envMatch = environment === 'ALL' || l.environment === environment;
                const moduleMatch = !subModuleId || l.subModule?.id === subModuleId;
                return envMatch && moduleMatch;
            });
            setLogs(filtered);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) fetchLogs();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [search, level, environment, subModuleId, token]);

    return (
        <div className="flex-1 flex overflow-hidden relative">
            {/* Facet Sidebar */}
            <aside className="w-72 glass border-r border-white/5 p-6 space-y-8 overflow-y-auto hidden lg:block shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Facet Explorer</h3>
                </div>

                <div className="space-y-6">
                    {/* Environments */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Environments</p>
                        <div className="space-y-2">
                            {['production', 'staging', 'development'].map(env => (
                                <button 
                                    key={env}
                                    onClick={() => setEnvironment(env)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                                        environment === env ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3 h-3 opacity-50" />
                                        <span className="capitalize">{env}</span>
                                    </div>
                                    <span className="text-[9px] opacity-40">1.2k</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Levels */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Log Levels</p>
                        <div className="space-y-2">
                            {['ALL', 'INFO', 'WARN', 'ERROR', 'FATAL'].map(l => (
                                <button 
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                                        level === l ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3 opacity-50" />
                                        <span>{l}</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        l === 'ERROR' || l === 'FATAL' ? 'bg-rose-500' : l === 'WARN' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Log Stream */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/20 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex-1 max-w-xl relative group">
                        <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="⌘ / Filter logs by message, trace, or fingerprint..." 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 pl-11 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono placeholder:text-slate-700"
                        />
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <button 
                            onClick={fetchLogs}
                            className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Activity className="w-3.5 h-3.5 pulse-indicator" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <AnimatePresence initial={false}>
                        {logs.map((log, idx) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                                className="group flex items-start gap-4 p-2 rounded-lg hover:bg-indigo-500/5 border border-transparent hover:border-white/5 transition-all cursor-pointer text-[11px] font-mono"
                            >
                                <div className="w-24 shrink-0 text-slate-600 font-bold tabular-nums">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                                    <span className="text-[9px] opacity-40">{new Date(log.timestamp).getMilliseconds()}ms</span>
                                </div>
                                <div className={`px-1.5 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-tighter shrink-0 ${
                                    log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-500' :
                                    log.level === 'FATAL' ? 'bg-rose-600 text-white' :
                                    log.level === 'WARN' ? 'bg-amber-500/20 text-amber-500' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {log.level}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-slate-200 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                        {log.message}
                                    </span>
                                    <div className="flex gap-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{log.environment}</span>
                                        {log.subModule && <span className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-widest">mod:{log.subModule.name}</span>}
                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">id:{log.id.substring(0,8)}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-800 group-hover:text-indigo-400 transition-colors shrink-0" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default LogViewer;
