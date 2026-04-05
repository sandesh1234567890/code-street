import { LayoutDashboard, ListFilter, AlertCircle, Settings, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ onNavigate, currentPage, onLogout, user }: any) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ListFilter, label: 'Live Tail', id: 'logs' },
        { icon: AlertCircle, label: 'Issues', id: 'issues' },
        { icon: Shield, label: 'Security & Projects', id: 'projects' },
        { icon: Settings, label: 'Infrastructure', id: 'settings' },
    ];

    return (
        <aside className="w-64 h-screen glass border-r border-white/5 flex flex-col pt-6 px-4 shrink-0 relative overflow-hidden">
            {/* Background Glow Decoration */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-3 px-2 mb-10 group cursor-pointer relative z-10">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                    <Shield className="text-white w-5 h-5" />
                </motion.div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">SENTINEL</h1>
                    <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] -mt-1">ANALYTICS</span>
                </div>
            </div>
            
            <nav className="space-y-2 relative z-10">
                {menuItems.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                                isActive 
                                    ? 'text-white' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent border-l-2 border-indigo-500 rounded-xl shadow-[inset_10px_0_20px_rgba(99,102,241,0.05)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="relative z-10 tracking-tight">{item.label}</span>
                            
                            {isActive && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] relative z-10"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            <div className="mt-auto pb-8 px-2 relative z-10">
                <div 
                    onClick={onLogout}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-emerald-500 opacity-60" />
                        </div>
                        <div className="flex flex-col overflow-hidden max-w-[120px]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.role || 'Guest'}</p>
                            <p className="text-xs font-bold text-slate-200 truncate">{user?.email || 'Not Logged In'}</p>
                        </div>
                        <div className="ml-auto flex items-center">
                             <Zap className="w-3 h-3 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
