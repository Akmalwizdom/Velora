import DashboardLayout from '@/layouts/app-dashboard-layout';
import { cn } from '@/lib/utils';
import { 
    Clock, 
    MoreVertical, 
    Play, 
    RotateCcw, 
    ShieldCheck, 
    Zap,
    TrendingUp,
    LayoutGrid,
    CheckCircle2,
    Users,
    MapPin,
    Monitor,
    Square
} from 'lucide-react';
import React, { useState } from 'react';

export default function AttendanceHub() {
    const [sessionActive, setSessionActive] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [note, setNote] = useState('');
    return (
        <DashboardLayout title="Attendance Hub" slimSidebar={true}>
            <div className="flex-1 flex flex-col items-center justify-center relative px-4 md:px-20 py-12 md:py-20 bg-[radial-gradient(circle_at_center,_rgba(19,200,236,0.03)_0%,_transparent_70%)]">
                {/* Top Path / Breadcrumbs - Embedded in page for fidelity */}
                <div className="absolute top-6 md:top-10 left-6 md:left-10 flex items-center gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-muted-dynamics/60 text-[10px] font-bold tracking-[0.2em] uppercase">HUB</span>
                        <span className="text-white/10 text-[10px]">/</span>
                        <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">OVERVIEW</span>
                    </div>
                </div>

                <div className="absolute top-6 md:top-10 right-6 md:right-10 flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                        <Monitor className="size-3.5 text-primary" />
                        <span className="text-[10px] font-bold tracking-widest text-muted-dynamics uppercase">Work Mode: Remote</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <div className={cn('size-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(19,200,236,0.5)]', sessionActive ? 'bg-primary' : 'bg-slate-500')}></div>
                        <span className="text-[10px] font-bold tracking-widest text-muted-dynamics uppercase">{sessionActive ? 'Session Active' : 'System Ready'}</span>
                    </div>
                </div>

                {/* Central Chronometer Architecture */}
                <div className="relative flex items-center justify-center mb-12 md:mb-16 scale-[0.7] sm:scale-90 xl:scale-100 transition-transform">
                    {/* Outer Decorative Rings */}
                    <div className="absolute size-[400px] md:size-[580px] rounded-full border border-white/[0.02]" />
                    <div className="absolute size-[360px] md:size-[540px] rounded-full border border-white/[0.03]" />
                    <div className="absolute size-[320px] md:size-[500px] rounded-full border border-white/[0.05]" />
                    
                    {/* Progress Arc */}
                    <svg className="absolute size-[300px] md:size-[460px] -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-white/5" cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle 
                            className="text-primary drop-shadow-[0_0_12px_rgba(19,200,236,0.6)]" 
                            cx="50" cy="50" fill="none" r="48" 
                            stroke="currentColor" strokeWidth="2" 
                            strokeDasharray="301.59" strokeDashoffset="240" 
                            strokeLinecap="round" 
                        />
                    </svg>

                    {/* Inner Status Content */}
                    <div className="relative size-[280px] md:size-[410px] rounded-full flex flex-col items-center justify-center bg-background-dark/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col items-center mb-4">
                            <Zap className="size-5 md:size-6 text-primary mb-2" />
                            <p className="text-muted-dynamics text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase">Pulse Alignment</p>
                        </div>
                        
                        {/* Main Timer Component */}
                        <div className="flex gap-2 md:gap-4 items-baseline mb-6 md:mb-8 text-white">
                            <TimeBlock value="00" label="HRS" />
                            <span className="text-3xl md:text-5xl font-light text-white/20 leading-none mb-4">:</span>
                            <TimeBlock value="00" label="MIN" />
                            <span className="text-3xl md:text-5xl font-light text-white/20 leading-none mb-4">:</span>
                            <TimeBlock value="00" label="SEC" isPrimary />
                        </div>

                        {/* Action Button */}
                        {!showNote ? (
                            <button 
                                onClick={() => {
                                    setSessionActive(!sessionActive);
                                    if (!sessionActive) setShowNote(true);
                                }}
                                className={cn(
                                    "group relative px-8 md:px-12 py-3 md:py-4 font-black text-xs md:text-sm tracking-[0.2em] uppercase rounded-xl transition-all flex items-center gap-3 active:scale-95 shadow-xl overflow-hidden",
                                    sessionActive ? "bg-white/10 text-white border border-white/10" : "bg-primary text-background-dark hover:shadow-[0_0_40px_rgba(19,200,236,0.5)]"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                {sessionActive ? <Square className="size-4 fill-current relative z-10" /> : <Play className="size-4 fill-current relative z-10" />}
                                <span className="relative z-10">{sessionActive ? 'End Session' : 'Start Session'}</span>
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="size-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Entry Captured</span>
                                </div>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Add context note (optional)..." 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setShowNote(false); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-muted-dynamics/30 focus:border-primary/50 outline-none transition-all"
                                />
                                <button 
                                    onClick={() => setShowNote(false)}
                                    className="text-[10px] font-black text-muted-dynamics/40 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Skip to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Today Status Context Row */}
                <div className="flex items-center gap-8 mb-12">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Today</span>
                        <span className="text-xs font-black text-white uppercase">On Time</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Schedule</span>
                        <span className="text-xs font-black text-white uppercase">09:00 - 18:00</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Cluster</span>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-primary" />
                            <span className="text-xs font-black text-white uppercase">Node-04</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Weekly Goal */}
                    <HubStatCard 
                        label="Weekly Goal" 
                        icon={<CheckCircle2 className="size-5 text-primary" />}
                    >
                        <div className="flex flex-col gap-3 mt-1">
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl md:text-3xl font-black text-white leading-none">32.5 <span className="text-xs font-normal text-muted-dynamics uppercase tracking-tighter">/ 40h</span></p>
                                <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded">81%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(19,200,236,0.6)]" style={{ width: '81%' }}></div>
                            </div>
                        </div>
                    </HubStatCard>

                    {/* Active Team */}
                    <HubStatCard 
                        label="Active Team" 
                        icon={<Users className="size-5 text-primary" />}
                        highlight
                    >
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="size-10 md:size-11 rounded-full border-2 border-background-dark bg-cover bg-center ring-4 ring-transparent hover:ring-primary/20 transition-all cursor-pointer overflow-hidden shadow-lg" style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=team${i}')` }}>
                                    </div>
                                ))}
                                <div className="size-10 md:size-11 rounded-full border-2 border-background-dark bg-surface-dark flex items-center justify-center text-[10px] md:text-[11px] font-bold text-white shadow-lg">+12</div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-white text-xs font-bold leading-tight">Live Cluster</p>
                                <p className="text-muted-dynamics text-[9px] md:text-[10px] uppercase font-bold tracking-tighter mt-0.5">Currently Synced</p>
                            </div>
                        </div>
                    </HubStatCard>

                    {/* Performance */}
                    <HubStatCard 
                        label="Performance" 
                        icon={<TrendingUp className="size-5 text-primary" />}
                    >
                        <div className="flex flex-col mt-1">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-2xl md:text-3xl font-black text-white leading-none">+12.4%</p>
                                <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                                    <TrendingUp className="size-3" /> PEAK
                                </div>
                            </div>
                            <div className="flex gap-1 h-8 md:h-10 items-end">
                                {[40, 66, 50, 85, 100, 75, 90].map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ height: `${h}%` }} 
                                        className={cn('flex-1 rounded-sm transition-all duration-500', i === 4 ? 'bg-primary shadow-[0_0_12px_rgba(19,200,236,0.5)]' : 'bg-white/10 hover:bg-white/20')} 
                                    />
                                ))}
                            </div>
                        </div>
                    </HubStatCard>
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:block absolute bottom-10 left-10 text-[10px] font-bold tracking-[0.4em] text-white/10 uppercase vertical-text origin-bottom-left rotate-180">
                    Neural Engine Interface
                </div>
            </div>
        </DashboardLayout>
    );
}

function TimeBlock({ value, label, isPrimary }: any) {
    return (
        <div className="flex flex-col items-center">
            <span className={cn('text-8xl font-black tracking-tighter leading-none transition-all', isPrimary ? 'text-primary drop-shadow-[0_0_15px_rgba(19,200,236,0.4)]' : 'text-white')}>
                {value}
            </span>
            <span className={cn('text-[11px] font-bold uppercase tracking-[0.3em] mt-3', isPrimary ? 'text-primary/70' : 'text-slate-500')}>
                {label}
            </span>
        </div>
    );
}

function HubStatCard({ label, icon, children, highlight }: any) {
    return (
        <div className={cn(
            'p-7 rounded-2xl flex flex-col gap-4 border transition-all duration-300 hover:scale-[1.02]',
            highlight ? 'bg-primary/5 border-primary/30 shadow-[0_10px_40px_rgba(19,200,236,0.05)]' : 'bg-[#111718]/50 backdrop-blur-md border-white/5 hover:border-white/10'
        )}>
            <div className="flex justify-between items-start">
                <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{label}</p>
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                    {icon}
                </div>
            </div>
            {children}
        </div>
    );
}
