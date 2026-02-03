import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/glass-panel';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { 
    Activity, 
    Bell, 
    ChevronRight, 
    MessageSquare, 
    MoreHorizontal, 
    Search, 
    TrendingUp, 
    Users, 
    Zap 
} from 'lucide-react';
import React from 'react';

export default function TeamAnalytics() {
    return (
        <DashboardLayout title="Team Analytics">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search team dynamics or members..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">42 Active Sessions</span>
                    </div>
                    
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-6 h-6" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark" />
                    </button>
                    
                    <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                        <div className="text-right">
                            <p className="text-sm font-semibold">Alex Rivera</p>
                            <p className="text-xs text-gray-500">Sr. Tech Lead</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 overflow-hidden" />
                    </div>
                </div>
            </div>

            {/* Page Title & Breadcrumbs */}
            <div className="mb-10">
                <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Team Dynamics Overview</h1>
                <p className="text-gray-400">Atmospheric monitoring of team synergy and productivity flows.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <StatCard 
                    label="Presence Velocity" 
                    value="94.2%" 
                    trend="+1.2%" 
                    icon={TrendingUp} 
                    color="primary"
                />
                <StatCard 
                    label="Avg Sentiment" 
                    value="Positive" 
                    trend="Stable" 
                    icon={MessageSquare} 
                    color="blue"
                />
                <StatCard 
                    label="Conflict Index" 
                    value="0.12" 
                    trend="-0.04" 
                    icon={Activity} 
                    color="red"
                />
                <StatCard 
                    label="Network Density" 
                    value="0.68" 
                    trend="+0.05" 
                    icon={Users} 
                    color="purple"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-8">
                {/* Atmospheric Map */}
                <GlassPanel className="col-span-2 p-8 h-[600px] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-xl font-display font-bold">Atmospheric Map</h3>
                        <div className="flex space-x-2">
                             <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span>Core Engineering</span>
                             </div>
                             <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>UX / Design</span>
                             </div>
                        </div>
                    </div>

                    {/* Simple Visualization Placeholder */}
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Center Orb */}
                        <div className="w-48 h-48 rounded-full bg-primary/20 blur-3xl animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-full h-full max-h-[400px]" viewBox="0 0 200 200">
                                {/* Orbit lines */}
                                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" className="text-primary" />
                                <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" className="text-primary" />
                                
                                {/* Connection lines */}
                                <line x1="100" y1="100" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" className="text-primary" />
                                <line x1="100" y1="100" x2="140" y2="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" className="text-primary" />
                                <line x1="100" y1="100" x2="90" y2="150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" className="text-primary" />
                                
                                {/* Nodes */}
                                <circle cx="100" cy="100" r="4" className="fill-primary orb-glow" />
                                <circle cx="60" cy="60" r="3" className="fill-blue-500" />
                                <circle cx="140" cy="80" r="3" className="fill-cyan-400" />
                                <circle cx="90" cy="150" r="3" className="fill-blue-600" />
                            </svg>
                        </div>
                        
                        {/* Dynamic Floating Tooltip */}
                        <div className="absolute top-1/4 right-1/4">
                            <GlassPanel className="p-3 border-primary/30 radial-glow">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-6 h-6 rounded bg-primary/20" />
                                    <span className="text-sm font-bold">Frontend Core</span>
                                </div>
                                <p className="text-[10px] text-gray-400">High Synergy Loop detected</p>
                            </GlassPanel>
                        </div>
                    </div>
                </GlassPanel>

                {/* Dynamics Feed */}
                <div className="space-y-6">
                    <h3 className="text-xl font-display font-bold">Dynamics Feed</h3>
                    <div className="space-y-4">
                        <FeedItem 
                            time="10:24 AM" 
                            title="Cross-department Sync" 
                            desc="Engineering and Design clusters merge for V2 sprint." 
                            type="merge"
                        />
                        <FeedItem 
                            time="09:15 AM" 
                            title="Velocity Peak" 
                            desc="Core systems reached 98.4% performance threshold." 
                            type="peak"
                        />
                         <FeedItem 
                            time="08:30 AM" 
                            title="Session Pulse" 
                            desc="All units established connection. 0% dropout rate." 
                            type="system"
                        />
                    </div>

                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center space-x-2 group">
                        <span className="font-medium">Analyze Full History</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: 'primary' | 'blue' | 'red' | 'purple' }) {
    const colors = {
        primary: 'text-primary bg-primary/10 border-primary/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        red: 'text-red-500 bg-red-500/10 border-red-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <GlassPanel className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2.5 rounded-xl border', colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <div className="flex items-end justify-between leading-none">
                <h2 className="text-2xl font-display font-bold">{value}</h2>
                <span className={cn('text-xs font-bold px-2 py-1 rounded-lg', trend.startsWith('+') ? 'text-green-400 bg-green-400/10' : trend.startsWith('-') ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-gray-400/10')}>
                    {trend}
                </span>
            </div>
        </GlassPanel>
    );
}

function FeedItem({ time, title, desc, type }: any) {
    return (
        <div className="group relative pl-8 pb-6 border-l border-white/10 last:pb-0">
            <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-primary ring-4 ring-primary/20 group-hover:scale-125 transition-transform" />
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{time}</p>
            <h4 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}
