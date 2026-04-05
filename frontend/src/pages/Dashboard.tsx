import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, AlertTriangle, Cpu, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DemoControlPanel from '../components/DemoControlPanel';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="glass p-6 rounded-2xl relative overflow-hidden group border-glow"
    >
        <div className={`absolute -top-12 -right-12 w-24 h-24 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-500`} />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-2.5 rounded-xl bg-${color}-500/20 text-${color}-400 shadow-[0_0_15px_rgba(var(--${color}-500),0.2)]`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
                {change}
            </div>
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">{value}</h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [seriesData, setSeriesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth();

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [statsRes, seriesRes] = await Promise.all([
                fetch('http://localhost:8081/api/logs/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8081/api/logs/series', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const statsData = await statsRes.json();
            const seriesData = await seriesRes.json();
            
            setStats(statsData);
            setSeriesData(seriesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
            const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
            return () => clearInterval(interval);
        }
    }, [token]);


    return (
        <div className="flex-1 p-8 space-y-10 overflow-y-auto relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white">System Sentinel</h2>
                    <p className="text-slate-500 font-medium mt-1 tracking-tight">Intelligence-driven telemetry & anomaly detection</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={fetchData}
                        className="px-5 py-2.5 glass rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 border-glow"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Metrics
                    </button>
                    <a 
                        href="http://localhost:8081/api/logs/export"
                        download
                        className="px-5 py-2.5 glass rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 border-glow"
                    >
                        <Activity className="w-3.5 h-3.5" /> Export Report
                    </a>
                    <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-black text-white hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        <Zap className="w-3.5 h-3.5" /> Live Engine
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <StatCard 
                    title="Ingested Logs" 
                    value={loading ? "---" : stats?.totalLogs?.toLocaleString() || "0"} 
                    change="+18.4%" 
                    icon={Activity} 
                    color="blue" 
                />
                <StatCard 
                    title="Active Alerts" 
                    value={loading ? "---" : stats?.activeIssues || "0"} 
                    change="-4" 
                    icon={AlertTriangle} 
                    color="amber" 
                />
                <StatCard 
                    title="Engine Latency" 
                    value={loading ? "---" : "38.2ms"} 
                    change="-2.1ms" 
                    icon={Cpu} 
                    color="indigo" 
                />
                <StatCard 
                    title="Anomaly Score" 
                    value={loading ? "---" : `${stats?.errorRate?.toFixed(2) || "0.00"}%`} 
                    change="+0.04%" 
                    icon={TrendingUp} 
                    color="rose" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div className="glass p-8 rounded-3xl border-glow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Ingestion Throughput</h3>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Logs per minute / real-time</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-indicator" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Flow</span>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={seriesData}>
                                <defs>
                                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="logs" stroke="#6366f1" fillOpacity={1} fill="url(#colorLogs)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-8 rounded-3xl border-glow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Anomaly Monitoring</h3>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Error spikes & distribution</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Critical Path</span>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={seriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#f43f5e', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Presentation Demo Panel */}
            <div className="relative z-10 pb-10">
                <DemoControlPanel onRefresh={fetchData} />
            </div>
        </div>
    );
};

export default Dashboard;
