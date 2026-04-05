import { useState } from 'react';
import { Play, AlertOctagon, Layers, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = 'sentinel-demo-key-2026';
const BASE_URL = 'http://localhost:8081/api/ingest';

const DemoControlPanel = ({ onRefresh }: { onRefresh: () => void }) => {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const showStatus = (msg: string) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), 3000);
    };

    const sendLog = async (type: 'info' | 'error' | 'batch' | 'auto10') => {
        setLoading(type);
        try {
            if (type === 'auto10') {
                const mixedLogs = [
                    { level: 'INFO', message: 'User session started: session_882', environment: 'production' },
                    { level: 'INFO', message: 'Payment gateway connection: OK', environment: 'production' },
                    { level: 'WARN', message: 'Sub-optimal query performance detected', environment: 'production' },
                    { level: 'INFO', message: 'Cache manifest updated', environment: 'production' },
                    { level: 'ERROR', message: 'Auth Service: Invalid token signature detect', stackTrace: 'com.auth.TokenException: Signature mismatch\n at com.auth.Verifier.verify(Verifier.java:44)', environment: 'production' },
                    { level: 'INFO', message: 'Image optimized and served from CDN', environment: 'production' },
                    { level: 'INFO', message: 'System health check completed', environment: 'production' },
                    { level: 'WARN', message: 'Rate limit approaching: 85%', environment: 'production' },
                    { level: 'ERROR', message: 'Inventory Service: SQL Deadlock', stackTrace: 'org.postgresql.util.PSQLException: Deadlock detected\n at org.postgresql.core.v3.QueryExecutor.processResults(QueryExecutor.java:2186)', environment: 'production' },
                    { level: 'INFO', message: 'Deployment rollout successful: v1.0.4', environment: 'production' }
                ];
                await fetch(`${BASE_URL}/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                    body: JSON.stringify({ logs: mixedLogs })
                });
                showStatus('Success: 10 Mixed Logs Ingested');
            } else if (type === 'info') {
                await fetch(`${BASE_URL}/logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                    body: JSON.stringify({
                        level: 'INFO',
                        message: 'System Health Check: Heartbeat active',
                        environment: 'production'
                    })
                });
                showStatus('Success: Info Heartbeat Sent');
            } else if (type === 'error') {
                await fetch(`${BASE_URL}/logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                    body: JSON.stringify({
                        level: 'ERROR',
                        message: 'Critical: Database connection pool exhausted',
                        environment: 'production',
                        stackTrace: 'java.sql.SQLException: Connection pool exhausted\n    at com.sentinel.db.ConnectionManager.getConnection(ConnectionManager.java:45)\n    at com.sentinel.service.PaymentService.process(PaymentService.java:122)'
                    })
                });
                showStatus('Detection Triggered: Error Logged');
            } else if (type === 'batch') {
                await fetch(`${BASE_URL}/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                    body: JSON.stringify({
                        logs: [
                            { level: 'INFO', message: 'User logged in: id_4452', environment: 'production' },
                            { level: 'WARN', message: 'Slow query detected: 450ms', environment: 'production' },
                            { level: 'INFO', message: 'Cache refreshed', environment: 'production' }
                        ]
                    })
                });
                showStatus('Success: Batch Payload Ingested');
            }
            onRefresh();
        } catch (err) {
            showStatus('Error: Backend Unreachable');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="glass p-6 rounded-3xl border-glow relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter">Presentation Engine</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Demo Control Unit</p>
                </div>
                <AnimatePresence>
                    {status && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-300 uppercase">{status}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                    onClick={() => sendLog('info')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/50 transition-all group"
                >
                    {loading === 'info' ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Play className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />}
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Heartbeat</p>
                        <p className="text-sm font-bold text-white leading-none">Auto Log Send</p>
                    </div>
                </button>

                <button 
                    onClick={() => sendLog('error')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/50 transition-all group"
                >
                    {loading === 'error' ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />}
                    <div className="text-left">
                        <p className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest leading-none mb-1">Anomaly</p>
                        <p className="text-sm font-bold text-rose-400 leading-none">Detection Error Throw</p>
                    </div>
                </button>

                <button 
                    onClick={() => sendLog('batch')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/50 transition-all group"
                >
                    {loading === 'batch' ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Layers className="w-4 h-4 text-indigo-400 group-hover:translate-y-[-2px] transition-transform" />}
                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-500/50 uppercase tracking-widest leading-none mb-1">Pipeline</p>
                        <p className="text-sm font-bold text-indigo-400 leading-none">Sagriga Batch Send</p>
                    </div>
                </button>

                <button 
                    onClick={() => sendLog('auto10')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/50 transition-all group"
                >
                    {loading === 'auto10' ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
                    <div className="text-left">
                        <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest leading-none mb-1">Intelligence</p>
                        <p className="text-sm font-bold text-emerald-400 leading-none">Auto Log 10 (Mixed)</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default DemoControlPanel;
