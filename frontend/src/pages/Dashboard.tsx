import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, AlertTriangle, Cpu, TrendingUp, Clock, Zap, RefreshCw } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
                {change}
            </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/stats');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const data = [
        { time: '12:00', logs: 400, errors: 24, latency: 45 },
        { time: '13:00', logs: 300, errors: 13, latency: 42 },
        { time: '14:00', logs: 600, errors: 98, latency: 67 },
        { time: '15:00', logs: 800, errors: 35, latency: 38 },
        { time: '16:00', logs: 500, errors: 21, latency: 41 },
        { time: '17:00', logs: 900, errors: 12, latency: 35 },
        { time: '18:00', logs: 1100, errors: 52, latency: 49 },
    ];

    return (
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                    <p className="text-muted-foreground mt-1">Real-time log ingestion and anomaly detection.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchStats}
                        className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium border border-border hover:bg-secondary/80 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Live Streaming
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Logs" 
                    value={loading ? "..." : stats?.totalLogs?.toLocaleString() || "0"} 
                    change="+12.5%" 
                    icon={Activity} 
                    color="blue" 
                />
                <StatCard 
                    title="Active Issues" 
                    value={loading ? "..." : stats?.activeIssues || "0"} 
                    change="-2" 
                    icon={AlertTriangle} 
                    color="amber" 
                />
                <StatCard 
                    title="Avg Latency" 
                    value={loading ? "..." : "42.5ms"} 
                    change="-1.2ms" 
                    icon={Cpu} 
                    color="indigo" 
                />
                <StatCard 
                    title="Error Rate" 
                    value={loading ? "..." : `${stats?.errorRate?.toFixed(2) || "0.00"}%`} 
                    change="+0.02%" 
                    icon={TrendingUp} 
                    color="rose" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-lg font-semibold mb-6">Ingestion Throughput (Logs/m)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="logs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLogs)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-lg font-semibold mb-6">Error Spike Detection</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
