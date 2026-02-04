import DashboardLayout from '@/layouts/app-dashboard-layout';
import { cn } from '@/lib/utils';
import { 
    AlertCircle, 
    ArrowRight, 
    CheckCircle2, 
    Clock, 
    History, 
    MessageSquare, 
    ShieldCheck,
    ChevronRight,
    Search,
    Info,
    X,
    Check
} from 'lucide-react';
import React from 'react';

export default function LogManagement() {
    return (
        <DashboardLayout title="Compliance & Trust">
            <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-hidden">
                {/* Main Compliance View */}
                <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6 md:mb-8 text-[10px] font-bold tracking-[0.2em] uppercase">
                        <span className="text-muted-dynamics/60">COMPLIANCE</span>
                        <ChevronRight className="size-3 text-white/10" />
                        <span className="text-muted-dynamics/60">LOG AUDIT</span>
                        <ChevronRight className="size-3 text-white/10" />
                        <span className="text-white">REQUEST_482</span>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Correction & Trust Center</h1>
                                <p className="text-muted-dynamics text-base md:text-lg">Cross-referencing telemetry with manual adjustment requests.</p>
                            </div>
                            <label className="h-12 md:h-14 px-4 md:px-6 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 focus-within:border-primary/30 transition-all cursor-text">
                                <Search className="size-5 text-muted-dynamics" />
                                <input type="text" placeholder="Audit via Request ID or Hash..." className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-48 text-white placeholder:text-muted-dynamics/40 outline-none" />
                            </label>
                        </div>

                        {/* Side-by-Side Comparison */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 min-h-[400px]">
                            {/* Original State */}
                            <div className="rounded-2xl border border-white/5 bg-header-background/40 overflow-hidden flex flex-col transition-all">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <span className="text-[10px] font-black tracking-widest text-muted-dynamics uppercase">Original Log State</span>
                                    <div className="flex gap-1">
                                        <div className="size-1.5 rounded-full bg-white/20"></div>
                                        <div className="size-1.5 rounded-full bg-white/20"></div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
                                        <div className="relative px-6 md:px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-xs md:text-sm font-bold text-muted-dynamics/60 mb-1">Time Captured</p>
                                            <p className="text-4xl md:text-5xl font-black text-muted-dynamics/40 line-through">08:42:15</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-center text-center">
                                        <p className="text-[10px] md:text-xs font-bold text-muted-dynamics/60 uppercase tracking-widest leading-none">Status: Immutable</p>
                                        <p className="text-[9px] md:text-[10px] text-muted-dynamics/40 font-medium">Auto-synced via Mesh Network Node #04</p>
                                    </div>
                                </div>
                            </div>

                            {/* Proposed Revision */}
                            <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] overflow-hidden flex flex-col relative group transition-all">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(19,200,236,0.1)_0%,_transparent_60%)]" />
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary/[0.05] relative z-10">
                                    <span className="text-[10px] font-black tracking-widest text-primary uppercase">Proposed Adjustment</span>
                                    <div className="flex gap-1 text-primary">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-10 relative z-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                        <div className="relative px-6 md:px-8 py-4 bg-background-dark rounded-2xl border border-primary/30 shadow-[0_4px_30px_rgba(19,200,236,0.2)]">
                                            <p className="text-xs md:text-sm font-bold text-primary mb-1">Request Value</p>
                                            <p className="text-5xl md:text-6xl font-black text-white">08:30:00</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-center text-center">
                                        <p className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em] leading-none">Status: Pending Verification</p>
                                        <p className="text-[9px] md:text-[10px] text-muted-dynamics font-medium">Submitted by Rivera, A. via Terminal Hub</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="min-h-20 flex flex-col md:flex-row items-center justify-between p-4 md:px-8 bg-header-background border border-white/5 rounded-2xl gap-4">
                            <div className="flex items-center gap-3">
                                <Info className="size-5 text-muted-dynamics/60" />
                                <p className="text-[10px] md:text-xs text-muted-dynamics font-medium text-center md:text-left">Compliance window closes in 4h 12m. Decisive action required for record finalization.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 text-muted-dynamics hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <X className="size-4" /> Decline
                                </button>
                                <button className="flex-1 md:flex-none px-6 md:px-10 py-3 rounded-xl bg-primary text-background-dark hover:shadow-[0_0_25px_rgba(19,200,236,0.3)] transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Check className="size-4" /> Accept & Commit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Reasoning Sidebar */}
                <aside className="w-full lg:w-80 xl:w-[380px] border-t lg:border-t-0 lg:border-l border-white/5 bg-background-dark flex flex-col shrink-0 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-white/5 bg-header-background/50 ring-1 ring-inset ring-white/[0.02]">
                        <p className="text-[10px] font-bold text-muted-dynamics/60 uppercase tracking-[0.3em] mb-4">Audit Context</p>
                        <div className="flex flex-col gap-1 text-white">
                            <p className="text-xs font-bold text-primary">Request #482</p>
                            <p className="text-[10px] text-muted-dynamics font-medium">Automatic system capture vs. Manual adjustment requested by Alex Rivera.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 md:gap-6 custom-scrollbar">
                        <ReasoningCard 
                            title="Proximity Context" 
                            desc="System telemetry suggests the user was active near Team Cluster Node-04 at the time of the requested adjustment." 
                            active 
                        />
                        <ReasoningCard 
                            title="Mesh Synchronization" 
                            desc="Detected minor packet jitter during the automated capture window which may explain the timestamp discrepancy." 
                        />

                        {/* Audit Log Timeline */}
                        <div className="flex flex-col gap-4 mt-4">
                            <p className="text-[10px] font-bold text-muted-dynamics/60 uppercase tracking-widest px-2">Audit Sequence</p>
                            <div className="flex flex-col gap-1">
                                <TimelineRow time="08:42" event="System capture (Auto)" status="mismatch" />
                                <TimelineRow time="14:05" event="Correction requested" status="pending" />
                                <TimelineRow time="14:06" event="Audit sequence finalized" status="success" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5">
                        <button className="w-full py-3 bg-white/5 border border-white/5 text-muted-dynamics hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <MessageSquare className="size-4" /> Add Comment
                        </button>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}

function ReasoningCard({ title, desc, active }: any) {
    return (
        <div className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer relative',
            active ? 'bg-primary/5 border-primary/20 shadow-[0_4px_20px_rgba(19,200,236,0.05)]' : 'bg-white/5 border-white/5 hover:border-white/10'
        )}>
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-white">{title}</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {desc}
            </p>
            {active && <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 size-4 text-primary" />}
        </div>
    );
}

function TimelineRow({ time, event, status }: any) {
    return (
        <div className="flex items-center gap-4 py-2 px-2 rounded-lg hover:bg-white/5 transition-all group">
            <p className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 w-10">{time}</p>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">{event}</p>
            </div>
            <div className={cn(
                'size-1.5 rounded-full',
                status === 'mismatch' ? 'bg-orange-500' : 
                status === 'pending' ? 'bg-slate-700' : 'bg-primary animate-pulse'
            )} />
        </div>
    );
}
