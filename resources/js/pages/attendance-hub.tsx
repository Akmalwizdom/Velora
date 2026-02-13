import DashboardLayout from '@/layouts/app-dashboard-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import LogManagement from './log-management';
import QrScanner from '@/components/ui/qr-scanner';
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
    Square,
    Loader2,
    Building2,
    Home,
    Laptop,
    Briefcase,
    ArrowRight,
    Timer,
    QrCode,
    Smartphone,
    BarChart3
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import type { AttendanceHubProps } from '@/types/attendance';
import { WeeklyRhythmPanel } from '@/components/ui/weekly-rhythm-panel';
import { BehavioralInsightsPanel } from '@/components/ui/behavioral-insights-panel';
import { checkIn, checkOut } from '@/routes/attendance';


interface PageProps extends AttendanceHubProps {}

export default function AttendanceHub({
    sessionActive: initialSessionActive = false,
    todayStatus = { status: 'not_checked_in', checkedInAt: null, schedule: '09:00 - 18:00', cluster: 'N/A', workMode: 'office' },
    weeklyProgress = { hoursWorked: 0, targetHours: 40, percentage: 0 },
    activeTeamMembers = { members: [], remainingCount: 0, totalActive: 0 },
    performanceData = { trend: 0, weeklyBars: [0, 0, 0, 0, 0, 0, 0] },
    attendanceMetrics = {
        presence: { current: 0, target: 0, percentage: 0 },
        punctuality: { rate: 0 },
        lateness: { count: 0 }
    }
}: PageProps) {
    const { props } = usePage();
    const { qrMode } = props as any; // Cast as any or fix PageProps to include inherited props if needed

    const [sessionActive, setSessionActive] = useState(initialSessionActive);
    const [showNote, setShowNote] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [showInsights, setShowInsights] = useState(false); // Toggle for insights panel

    // Forms for check-in/out
    const { post, processing, data, setData } = useForm({ note: '' });

    // Filter team presence data from the actual props
    const activeStats = useMemo(() => ({
        presence: attendanceMetrics.presence.percentage,
        active: activeTeamMembers.totalActive,
        remote: activeTeamMembers.members.filter(m => m.status === 'remote').length
    }), [attendanceMetrics.presence.percentage, activeTeamMembers.totalActive, activeTeamMembers.members]);

    // Timer effect
    useEffect(() => {
        if (!sessionActive || !todayStatus.checkedInAt) return;

        // Calculate initial elapsed from full ISO timestamp
        const checkedInDate = new Date(todayStatus.checkedInAt);
        const initialElapsed = Math.floor((Date.now() - checkedInDate.getTime()) / 1000);
        setElapsedTime(Math.max(0, initialElapsed));

        const interval = setInterval(() => {
            setElapsedTime(s => s + 1);
            setCurrentTime(new Date()); // Update current time for display
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionActive, todayStatus.checkedInAt]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        };
    };

    const time = formatTime(elapsedTime);

    const handleStartSession = () => {
        if (qrMode === 'required') {
            setIsScannerOpen(true);
            return;
        }

        // Use regular manual check-in if not required
        post(checkIn.url(), {
            onSuccess: () => {
                setSessionActive(true);
                setShowNote(true);
            },
        });
    };

    const handleEndSession = () => {
        post(checkOut.url(), {
            onSuccess: () => {
                setSessionActive(false);
                setShowNote(false);
            },
        });
    };

    const handleNoteSubmit = () => {
        setShowNote(false);
    };

    const handleQrSuccess = (attendance: any) => {
        setIsScannerOpen(false);
        // Reload page to get fresh state (or update local state if preferred)
        window.location.reload();
    };

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
                <div className="absolute top-6 md:top-10 right-6 md:right-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <div className={cn('size-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(19,200,236,0.5)]', sessionActive ? 'bg-primary' : 'bg-slate-500')}></div>
                        <span className="text-[10px] font-bold tracking-widest text-muted-dynamics uppercase">{sessionActive ? 'Checked In' : 'Ready to Check In'}</span>
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
                            strokeDasharray="301.59" strokeDashoffset={301.59 - (301.59 * weeklyProgress.percentage / 100)}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Inner Status Content */}
                    <div className="relative size-[280px] md:size-[410px] rounded-full flex flex-col items-center justify-center bg-background-dark/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col items-center mb-4">
                            <Zap className="size-5 md:size-6 text-primary mb-2" />
                            <p className="text-muted-dynamics text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase">Work Hours</p>
                        </div>

                        {/* Main Timer Component */}
                        <div className="flex gap-2 md:gap-4 items-baseline mb-6 md:mb-8 text-white">
                            <TimeBlock value={time.hours} label="HRS" />
                            <span className="text-3xl md:text-5xl font-light text-white/20 leading-none mb-4">:</span>
                            <TimeBlock value={time.minutes} label="MIN" />
                            <span className="text-3xl md:text-5xl font-light text-white/20 leading-none mb-4">:</span>
                            <TimeBlock value={time.seconds} label="SEC" isPrimary />
                        </div>


                        {/* Action Button */}
                        {!showNote ? (
                            <div className="flex flex-col items-center">
                                {!sessionActive ? (
                                    <button
                                        onClick={handleStartSession}
                                        disabled={processing}
                                        className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(19,200,236,0.3)] hover:shadow-[0_15px_40px_rgba(19,200,236,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            {qrMode === 'required' ? <QrCode className="size-5" /> : <Play className="size-5 fill-current" />}
                                            {qrMode === 'required' ? 'Mulai Presensi (QR)' : 'Check In'}
                                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEndSession}
                                        disabled={processing}
                                        className="group relative px-8 py-4 bg-destructive text-destructive-foreground rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="size-5" />
                                            Check Out
                                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                )}

                                {/* Fallback Manual Link for Mixed Modes */}
                                {qrMode !== 'required' && !sessionActive && (
                                    <button
                                        onClick={() => post(checkIn.url())}
                                        className="ml-4 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-dynamics/40 hover:text-primary transition-colors"
                                    >
                                        Atau Check-In Manual
                                    </button>
                                )}

                                {qrMode === 'required' && !sessionActive && (
                                    <p className="mt-4 text-[9px] font-bold text-muted-dynamics/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Smartphone className="size-3" />
                                        QR Scanner Diperlukan untuk Validasi
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="size-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Checked In Successfully</span>
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Add a note (optional)..."
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleNoteSubmit(); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-muted-dynamics/30 focus:border-primary/50 outline-none transition-all"
                                />
                                <button
                                    onClick={handleNoteSubmit}
                                    className="text-[10px] font-black text-muted-dynamics/40 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* QR Scanner Overlay */}
                {isScannerOpen && (
                    <QrScanner
                        onSuccess={handleQrSuccess}
                        onClose={() => setIsScannerOpen(false)}
                    />
                )}

                {/* Today Status Context Row */}
                <div className="flex items-center gap-8 mb-12">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Today</span>
                        <span className="text-xs font-black text-white uppercase">{todayStatus.status === 'on_time' ? 'On Time' : todayStatus.status === 'late' ? 'Late' : 'Not Checked In'}</span>
                        {todayStatus.checkedInAt && (
                            <span className="text-[8px] text-primary/60 font-medium">@ {new Date(todayStatus.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Schedule</span>
                        <span className="text-xs font-black text-white uppercase">{todayStatus.schedule}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest">Cluster</span>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-primary" />
                            <span className="text-xs font-black text-white uppercase">{todayStatus.cluster}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Kehadiran Card */}
                    <HubStatCard 
                        label="Kehadiran" 
                        icon={<CheckCircle2 className="size-5 text-primary" />}
                    >
                        <div className="flex flex-col gap-3 mt-1">
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl md:text-3xl font-black text-white leading-none">{attendanceMetrics.presence.current} <span className="text-xs font-normal text-muted-dynamics uppercase tracking-tighter">/ {attendanceMetrics.presence.target} Hari</span></p>
                                <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded">{attendanceMetrics.presence.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(19,200,236,0.6)]" style={{ width: `${attendanceMetrics.presence.percentage}%` }}></div>
                            </div>
                        </div>
                    </HubStatCard>

                    {/* Ketepatan Card */}
                    <HubStatCard 
                        label="Ketepatan" 
                        icon={<Clock className="size-5 text-primary" />}
                        highlight
                    >
                        <div className="flex items-center gap-4 mt-1">
                            {/* Radial Percentage Indicator */}
                            <div className="relative size-14 md:size-16 flex items-center justify-center">
                                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                                    <circle className="text-white/5" cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" />
                                    <circle 
                                        className="text-primary drop-shadow-[0_0_8px_rgba(19,200,236,0.5)]" 
                                        cx="50" cy="50" r="44" fill="none" 
                                        stroke="currentColor" strokeWidth="12" 
                                        strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * attendanceMetrics.punctuality.rate / 100)} 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                                <span className="text-[10px] md:text-xs font-black text-white">{attendanceMetrics.punctuality.rate}%</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-white text-xs font-bold leading-tight">Punctuality Rate</p>
                                <p className="text-muted-dynamics text-[9px] md:text-[10px] uppercase font-bold tracking-tighter mt-0.5">Bulan Ini</p>
                            </div>
                        </div>
                    </HubStatCard>

                    {/* Keterlambatan Card */}
                    <HubStatCard 
                        label="Keterlambatan" 
                        icon={<Zap className="size-5 text-amber-500" />}
                    >
                        <div className="flex flex-col mt-1">
                            <div className="flex justify-between items-center">
                                <p className="text-2xl md:text-3xl font-black text-white leading-none">{attendanceMetrics.lateness.count} <span className="text-xs font-normal text-muted-dynamics uppercase tracking-tighter">Kali</span></p>
                                <div className={cn(
                                    "flex items-center gap-1 text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded",
                                    attendanceMetrics.lateness.count > 0 ? "text-amber-400 bg-amber-500/10" : "text-green-400 bg-green-500/10"
                                )}>
                                    {attendanceMetrics.lateness.count > 3 ? 'WARNING' : attendanceMetrics.lateness.count > 0 ? 'ALERT' : 'PERFECT'}
                                </div>
                            </div>
                            <p className="text-muted-dynamics text-[9px] md:text-[10px] uppercase font-bold tracking-tighter mt-2">Terdeteksi Terlambat Bulan Ini</p>
                        </div>
                    </HubStatCard>
                </div>

                {/* Weekly Rhythm & Insights Section */}
                <div className="w-full max-w-[1100px] mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            Weekly Insights
                        </span>
                        <button
                            onClick={() => setShowInsights(!showInsights)}
                            className="text-[10px] font-bold text-muted-dynamics hover:text-primary transition-colors uppercase tracking-wide"
                        >
                            {showInsights ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                    
                    <div className={cn(
                        'grid gap-6 transition-all duration-500',
                        showInsights ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    )}>
                        <WeeklyRhythmPanel className="w-full" />
                        {showInsights && (
                            <BehavioralInsightsPanel className="w-full animate-in fade-in slide-in-from-right-4 duration-300" />
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:block absolute bottom-10 left-10 text-[10px] font-bold tracking-[0.4em] text-white/10 uppercase vertical-text origin-bottom-left rotate-180">
                    Velora Intelligence Interface
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
