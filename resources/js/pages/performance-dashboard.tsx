import DashboardLayout from '@/layouts/app-dashboard-layout';
import { cn } from '@/lib/utils';
import { 
    Activity, 
    ArrowUpRight, 
    ChevronRight, 
    Coffee, 
    Layout, 
    Settings, 
    Target, 
    Zap,
    TrendingUp,
    Clock,
    ShieldCheck,
    MessageSquare,
    ZapOff,
    Code2,
    Users
} from 'lucide-react';
import React from 'react';

export default function PerformanceDashboard() {
    return (
        <DashboardLayout title="Performance Dashboard" slimSidebar={true}>
            <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-hidden">
                {/* Main Productivity View */}
                <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6 md:mb-8 text-[10px] font-bold tracking-[0.2em] text-muted-dynamics/60 uppercase">
                        <span>PRODUCTIVITY</span>
                        <ChevronRight className="size-3 text-white/10" />
                        <span className="text-white">USER_INSIGHTS</span>
                    </div>

                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Today Summary - Compliance with Baseline */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-muted-dynamics/60 uppercase tracking-widest mb-1">Attendance State</p>
                                <p className="text-2xl font-black text-white">Checked In</p>
                                <p className="text-[10px] text-primary font-bold mt-1 uppercase">On Time</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-muted-dynamics/60 uppercase tracking-widest mb-1">Active Hours</p>
                                <p className="text-2xl font-black text-white">6.4h</p>
                                <p className="text-[10px] text-muted-dynamics/40 font-bold mt-1 uppercase">Today</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-muted-dynamics/60 uppercase tracking-widest mb-1">Work Mode</p>
                                <p className="text-2xl font-black text-white">Deep Focus</p>
                                <p className="text-[10px] text-muted-dynamics/40 font-bold mt-1 uppercase">Current</p>
                            </div>
                        </div>

                        {/* Recent Activity Feed - Renamed from Personal Activity Feed to be less surveillance-heavy */}
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h3>
                                <button className="text-[10px] font-bold text-muted-dynamics/60 hover:text-white uppercase tracking-widest transition-colors">See Full Log</button>
                            </div>
                            <div className="space-y-1">
                                <PersonalLogItem time="09:24" title="Check-in automated" desc="Frontend Architecture realignment started." status="success" icon={<Clock className="size-3" />} />
                                <PersonalLogItem time="11:15" title="Collaboration Sync" desc="Core Team Sync: Project Velocity review." status="collab" icon={<Users className="size-3" />} />
                                <PersonalLogItem time="12:30" title="Manual Pulse Adjustment" desc="Correction requested for morning capture error." status="alert" icon={<MessageSquare className="size-3" />} />
                                <PersonalLogItem time="14:02" title="Check-out detected" desc="Shift transition detected." status="success" icon={<Zap className="size-3" />} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Performance Context Sidebar */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-background-dark flex flex-col shrink-0">
                    <div className="p-6 md:p-8 border-b border-white/5 bg-header-background/50 ring-1 ring-inset ring-white/[0.02]">
                        <p className="text-[10px] font-bold text-muted-dynamics/60 uppercase tracking-[0.3em] mb-6">Work Mode Selection</p>
                        <div className="flex flex-col gap-2">
                            <ModeButton label="Deep Focus" icon={<Zap className="size-4" />} active />
                            <ModeButton label="Collaboration" icon={<Users className="size-4" />} />
                            <ModeButton label="Recharge / Away" icon={<Coffee className="size-4" />} />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                        {/* Weekly Pattern Breakdown */}
                        <div className="flex flex-col gap-4">
                            <p className="text-[10px] font-bold text-muted-dynamics/60 uppercase tracking-widest px-2">Weekly Pattern</p>
                            <div className="flex justify-between items-end h-24 px-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                {[30, 60, 45, 90, 100, 20, 10].map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                        <div style={{ height: `${h}%` }} className={cn('w-1.5 rounded-full transition-all', i === 4 ? 'bg-primary shadow-[0_0_8px_#13c8ec]' : 'bg-white/10')} />
                                        <span className="text-[8px] font-bold text-muted-dynamics/40">{"MTWTFSS"[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Simple Info Section */}
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-dynamics/60 uppercase tracking-widest mb-2">Workspace Insight</p>
                            <p className="text-[11px] text-muted-dynamics/40 leading-relaxed font-medium">
                                Your attendance patterns are currently balanced. Deep focus windows are most effective between 09:00 - 11:30 based on your historical check-in times.
                            </p>
                        </div>
                    </div>

                </aside>
            </div>
        </DashboardLayout>
    );
}

function MiniStat({ label, value, subValue, icon, color }: any) {
    const isPrimary = color === 'primary';
    return (
        <div className={cn(
            'p-5 rounded-xl border flex flex-col gap-2 transition-all hover:border-white/10',
            isPrimary ? 'bg-primary/5 border-primary/20 shadow-[0_10px_30px_rgba(19,200,236,0.05)]' : 'bg-white/5 border-white/5'
        )}>
            <div className="flex justify-between items-center">
                <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">{label}</p>
                <div className={cn('size-8 rounded-lg flex items-center justify-center border border-white/5', isPrimary ? 'bg-primary text-[#111718]' : 'bg-white/5 text-slate-500')}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className={cn('text-[10px] font-bold uppercase', isPrimary ? 'text-primary' : 'text-slate-600')}>{subValue}</p>
            </div>
        </div>
    );
}

function PersonalLogItem({ time, title, desc, status, icon }: any) {
    return (
        <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-white/[0.03] transition-all group cursor-pointer border border-transparent hover:border-white/5">
            <p className="text-xs font-bold text-slate-600 group-hover:text-slate-400 transition-colors w-10">{time}</p>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 hidden md:flex">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
            </div>
            <div className={cn(
                'size-2.5 rounded-full ring-4 ring-transparent',
                status === 'focus' ? 'bg-primary ring-primary/10' : 
                status === 'collab' ? 'bg-purple-500 ring-purple-500/10' : 
                status === 'alert' ? 'bg-orange-500 ring-orange-500/10' : 'bg-green-500 ring-green-500/10'
            )} />
        </div>
    );
}

function ModeButton({ label, icon, active }: any) {
    return (
        <button className={cn(
            'w-full p-4 rounded-xl flex items-center justify-between border transition-all group',
            active ? 'bg-primary text-[#111718] border-primary shadow-[0_10px_30px_rgba(19,200,236,0.2)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
        )}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
            {active && <div className="size-1.5 rounded-full bg-[#111718] animate-pulse" />}
        </button>
    );
}

function AchievementBadge({ title, icon }: any) {
    return (
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-2 text-center group hover:bg-white/10 transition-all cursor-pointer">
            <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            <p className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase tracking-tight">{title}</p>
        </div>
    );
}
