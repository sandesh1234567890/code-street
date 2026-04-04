import { useState, useEffect } from 'react';
import { Search, ArrowRight, Table as TableIcon, RefreshCw } from 'lucide-react';

const LogViewer = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('ALL');
    const [environment, setEnvironment] = useState('production');
    const [subModuleId, setSubModuleId] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = new URL('http://localhost:8080/api/logs');
            if (level !== 'ALL') url.searchParams.append('level', level);
            if (search) url.searchParams.append('search', search);

            const response = await fetch(url.toString());
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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [search, level, environment, subModuleId]);

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <TableIcon className="w-8 h-8 text-indigo-500" /> Log Explorer
                    </h2>
                    <p className="text-muted-foreground mt-1">Sift through millions of logs with blazingly fast full-text search.</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter logs by message, trace, or fingerprint..." 
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-md py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                </div>
                <select 
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900/50 rounded-md text-xs border border-slate-800 hover:bg-slate-800 focus:outline-none cursor-pointer text-slate-300"
                >
                    <option value="ALL">All Envs</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                </select>
                <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900/50 rounded-md text-xs border border-slate-800 hover:bg-slate-800 focus:outline-none cursor-pointer text-slate-300"
                >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">Info</option>
                    <option value="WARN">Warning</option>
                    <option value="ERROR">Error</option>
                    <option value="FATAL">Fatal</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                                        <span>Searching logs...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && logs.length === 0 && !error && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    No logs found matching your criteria.
                                </td>
                            </tr>
                        )}
                        {error && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-rose-500 bg-rose-500/5">
                                    Error loading logs: {error}
                                </td>
                            </tr>
                        )}
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-indigo-500/5 border-b border-white/5 transition-colors group cursor-pointer text-[11px]">
                                <td className="px-6 py-2.5 whitespace-nowrap">
                                    <span className={`px-1.5 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-tighter ${
                                        log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-500' :
                                        log.level === 'FATAL' ? 'bg-rose-600 text-white' :
                                        log.level === 'WARN' ? 'bg-amber-500/20 text-amber-500' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="px-6 py-2.5">
                                    <div className="flex flex-col">
                                        <p className="font-medium text-slate-200 line-clamp-1 font-mono tracking-tight">{log.message}</p>
                                        <div className="flex gap-3 text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest font-semibold">
                                            <span>Env: {log.environment}</span>
                                            {log.subModule && <span>Mod: {log.subModule.name}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-2.5">
                                    <span className="text-slate-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{log.project?.name || 'n/a'}</span>
                                </td>
                                <td className="px-6 py-2.5 whitespace-nowrap tabular-nums">
                                    <span className="text-slate-400">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                                        <span className="text-[9px] opacity-50">{new Date(log.timestamp).getMilliseconds()}ms</span>
                                    </span>
                                </td>
                                <td className="px-6 py-2.5 text-right">
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-400 transition-colors inline" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogViewer;
