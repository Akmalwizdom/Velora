import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/glass-panel';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { 
    Activity, 
    ArrowUpRight, 
    ChevronRight, 
    Coffee, 
    Layout, 
    Settings, 
    Target, 
    Zap 
} from 'lucide-react';
import React from 'react';

export default function PerformanceDashboard() {
    return (
        <DashboardLayout title="Performance Dashboard" slimSidebar={true}>
            <div className="max-w-6xl mx-auto">
                {/* Header Area */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Session Active</p>
                        <h1 className="text-3xl font-display font-bold">Good morning, Alex</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold">Focus Mode: ON</p>
                            <p className="text-[10px] text-gray-500">2h 14m remaining</p>
                        </div>
                        <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Velocity & Modes */}
                    <div className="col-span-8 space-y-8">
                        {/* Velocity Sparkline Card */}
                        <GlassPanel className="p-8 border-primary/20 radial-glow h-80 flex flex-col justify-between overflow-hidden relative">
                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Productivity Velocity</h3>
                                    <div className="flex items-end space-x-3">
                                        <h2 className="text-5xl font-display font-bold">+24%</h2>
                                        <div className="mb-2 text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded flex items-center">
                                            <ArrowUpRight className="w-4 h-4 mr-1" />
                                            Optimal
                                        </div>
                                    </div>
                                </div>
                                <Activity className="w-8 h-8 text-primary/40" />
                            </div>

                            {/* Abstract Sparkline (SVG) */}
                            <div className="absolute inset-0 top-32 px-8 pb-8">
                                <svg className="w-full h-full" viewBox="0 0 400 100">
                                    <path 
                                        d="M0 80 Q 40 40, 80 60 T 160 30 T 240 70 T 320 20 T 400 50" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="4" 
                                        className="text-primary drop-shadow-[0_0_8px_rgba(19,200,236,0.6)]" 
                                    />
                                    <path 
                                        d="M0 80 Q 40 40, 80 60 T 160 30 T 240 70 T 320 20 T 400 50 L 400 100 L 0 100 Z" 
                                        className="fill-primary/5" 
                                    />
                                </svg>
                            </div>
                        </GlassPanel>

                        {/* Work Modes Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            <ModeCard 
                                icon={Target} 
                                label="Focus Mode" 
                                status="Active" 
                                active={true}
                                desc="High-concentration tasks with zero distractions."
                            />
                            <ModeCard 
                                icon={Layout} 
                                label="Collaborate" 
                                status="Ready" 
                                active={false}
                                desc="Inter-unit communication and review sessions."
                            />
                             <ModeCard 
                                icon={Coffee} 
                                label="Recharge" 
                                status="Systemic" 
                                active={false}
                                desc="Regulated cognitive reset and buffer period."
                            />
                        </div>
                    </div>

                    {/* Right Column: Time Log & Stats */}
                    <div className="col-span-4 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Time Logs</h3>
                            <button className="text-xs text-primary hover:underline">View all</button>
                        </div>
                        
                        <div className="space-y-4">
                            <LogItem time="09:30 AM" duration="1h 45m" category="Core Systems" />
                            <LogItem time="11:15 AM" duration="1h 12m" category="Backend Arch" />
                            <LogItem time="01:30 PM" duration="0h 42m" category="Interface Align" />
                            <LogItem time="02:15 PM" duration="--:--" category="Focus Session" active={true} />
                        </div>

                        {/* Network Stats Card */}
                        <GlassPanel className="p-6 bg-blue-500/5 mt-8 border-blue-500/10">
                            <h4 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-4">Network Status</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Latency</span>
                                    <span className="font-mono text-blue-300">12ms</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Node Trust</span>
                                    <span className="font-bold text-primary">Elite</span>
                                </div>
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ModeCard({ icon: Icon, label, status, active, desc }: any) {
    return (
        <GlassPanel className={cn(
            'p-6 h-full transition-all group',
            active ? 'border-primary/40 radial-glow ring-2 ring-primary/10' : 'hover:border-white/20'
        )}>
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-3 rounded-xl', active ? 'bg-primary text-black' : 'bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-white/10')}>
                    <Icon className="w-5 h-5" />
                </div>
                {active && <div className="w-2 h-2 rounded-full bg-primary orb-glow animate-pulse" />}
            </div>
            <h4 className="text-sm font-bold mb-1">{label}</h4>
            <div className="text-[10px] uppercase font-bold text-primary mb-3">{status}</div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
        </GlassPanel>
    );
}

function LogItem({ time, duration, category, active = false }: any) {
    return (
        <div className={cn(
            'flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group',
            active ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10'
        )}>
            <div className="flex items-center space-x-4">
                <div className={cn('w-1.5 h-6 rounded-full', active ? 'bg-primary' : 'bg-white/10 group-hover:bg-white/20')} />
                <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">{time}</p>
                    <p className="text-sm font-semibold">{category}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={cn('text-sm font-display font-medium', active ? 'text-primary' : 'text-gray-400')}>{duration}</p>
                 {active && <span className="text-[8px] uppercase font-bold text-primary">Current</span>}
            </div>
        </div>
    );
}
