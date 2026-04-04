import { LayoutDashboard, ListFilter, AlertCircle, Settings, Shield } from 'lucide-react';

const Sidebar = ({ onNavigate, currentPage }: any) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ListFilter, label: 'Live Tail', id: 'logs' },
        { icon: AlertCircle, label: 'Issues', id: 'issues' },
        { icon: Shield, label: 'Security & Projects', id: 'projects' },
        { icon: Settings, label: 'Infrastructure', id: 'settings' },
    ];

    return (
        <aside className="w-64 h-screen border-r border-border bg-card/50 flex flex-col pt-6 px-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3 px-2 mb-10 group cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-white/5">
                    <Shield className="text-primary-foreground w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Sentinel</h1>
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                            currentPage === item.id 
                                ? 'bg-indigo-600/15 text-indigo-400 ring-1 ring-indigo-500/30' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                    >
                        <item.icon className={`w-4 h-4 ${currentPage === item.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pb-6 px-2">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                    <p className="text-sm font-medium">Hackathon Admin</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
