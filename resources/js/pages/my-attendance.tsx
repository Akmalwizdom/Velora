import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import type { MyAttendanceProps, AttendanceRecord, CorrectionRecord } from '@/types/attendance';
import { WeeklyRhythmPanel } from '@/components/ui/weekly-rhythm-panel';
import { BehavioralInsightsPanel } from '@/components/ui/behavioral-insights-panel';
import {
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertTriangle,
    XCircle,
    TrendingUp,
    FileEdit,
    ArrowRight,
    Timer,
} from 'lucide-react';

type Tab = 'history' | 'corrections' | 'insights';

export default function MyAttendance({
    attendanceHistory = [],
    corrections = [],
    monthlyStats = {
        totalDays: 22,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        avgHoursPerDay: 0,
    },
}: MyAttendanceProps) {
    const [activeTab, setActiveTab] = useState<Tab>('history');
    const [historyPage, setHistoryPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedHistory = useMemo(() => {
        const start = (historyPage - 1) * itemsPerPage;
        return attendanceHistory.slice(start, start + itemsPerPage);
    }, [attendanceHistory, historyPage]);

    const totalHistoryPages = Math.ceil(attendanceHistory.length / itemsPerPage);

    const pendingCorrections = corrections.filter(c => c.status === 'pending').length;

    return (
        <DashboardLayout title="Kehadiran Saya">
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Header Stats */}
                <div className="px-4 md:px-8 pt-6">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Kehadiran <span className="text-primary">Saya</span>
                        </h1>
                        <p className="text-xs font-bold text-muted-dynamics/60 uppercase tracking-widest mt-1">
                            Riwayat, koreksi, dan pola kehadiran pribadi
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <MiniStat icon={CalendarDays} label="Hari Kerja" value={String(monthlyStats.totalDays)} color="blue" />
                        <MiniStat icon={CheckCircle} label="Hadir" value={String(monthlyStats.presentDays)} color="green" />
                        <MiniStat icon={AlertTriangle} label="Terlambat" value={String(monthlyStats.lateDays)} color="amber" />
                        <MiniStat icon={XCircle} label="Tidak Hadir" value={String(monthlyStats.absentDays)} color="red" />
                        <MiniStat icon={Timer} label="Rata-rata / Hari" value={`${monthlyStats.avgHoursPerDay}j`} color="cyan" />
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="px-4 md:px-8 border-b border-white/5">
                    <div className="flex gap-1">
                        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
                            Riwayat
                        </TabButton>
                        <TabButton active={activeTab === 'corrections'} onClick={() => setActiveTab('corrections')}>
                            Koreksi {pendingCorrections > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-[8px] font-black bg-amber-500/20 text-amber-400 rounded-full">{pendingCorrections}</span>
                            )}
                        </TabButton>
                        <TabButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')}>
                            Pola Kehadiran
                        </TabButton>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    {activeTab === 'history' && (
                        <HistoryTab
                            records={paginatedHistory}
                            currentPage={historyPage}
                            totalPages={totalHistoryPages}
                            totalRecords={attendanceHistory.length}
                            onPageChange={setHistoryPage}
                        />
                    )}
                    {activeTab === 'corrections' && (
                        <CorrectionsTab corrections={corrections} />
                    )}
                    {activeTab === 'insights' && (
                        <InsightsTab />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

/* ──────────────────────── Mini Stat ──────────────────────── */

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/10',
        green: 'text-green-400 bg-green-500/10 border-green-500/10',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/10',
        red: 'text-red-400 bg-red-500/10 border-red-500/10',
        cyan: 'text-primary bg-primary/10 border-primary/10',
    };
    return (
        <div className={cn("p-4 rounded-2xl border flex items-center gap-3", colorMap[color])}>
            <Icon className="size-5 shrink-0" />
            <div>
                <p className="text-[9px] font-bold uppercase opacity-60">{label}</p>
                <p className="text-lg font-black text-white">{value}</p>
            </div>
        </div>
    );
}

/* ──────────────────────── Tab Button ──────────────────────── */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'px-5 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-t-xl border-b-2 flex items-center',
                active
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-muted-dynamics/60 border-transparent hover:text-white hover:bg-white/5'
            )}
        >
            {children}
        </button>
    );
}

/* ──────────────────────── History Tab ──────────────────────── */

function HistoryTab({
    records,
    currentPage,
    totalPages,
    totalRecords,
    onPageChange,
}: {
    records: AttendanceRecord[];
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    onPageChange: (p: number) => void;
}) {
    const statusConfig: Record<string, { label: string; class: string }> = {
        on_time: { label: 'Tepat Waktu', class: 'text-green-400 bg-green-500/5 border-green-500/10' },
        late: { label: 'Terlambat', class: 'text-amber-400 bg-amber-500/5 border-amber-500/10' },
        absent: { label: 'Tidak Hadir', class: 'text-red-400 bg-red-500/5 border-red-500/10' },
        correction: { label: 'Dikoreksi', class: 'text-blue-400 bg-blue-500/5 border-blue-500/10' },
    };

    return (
        <div>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="size-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Riwayat Kehadiran</h3>
                        <p className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Bulan Ini</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {records.length > 0 ? records.map((record) => {
                        const cfg = statusConfig[record.status] || statusConfig.on_time;
                        return (
                            <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                        <span className="text-[8px] font-black text-muted-dynamics/40 uppercase leading-none mb-0.5">TGL</span>
                                        <span className="text-xs font-black text-white leading-none">{record.date.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-white">{record.checkIn || '--:--'}</span>
                                        <ArrowRight className="size-3 text-muted-dynamics/30" />
                                        <span className="text-sm font-bold text-muted-dynamics">{record.checkOut || '--:--'}</span>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-dynamics/40 font-bold">
                                        <TrendingUp className="size-3" />
                                        <span>{record.hoursWorked}j kerja</span>
                                    </div>
                                </div>
                                <div className={cn("px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest", cfg.class)}>
                                    {cfg.label}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-16 text-center opacity-30">
                            <CalendarDays className="size-12 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Belum ada riwayat</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-bold text-muted-dynamics/30 uppercase tracking-widest">{totalRecords} Record</p>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="size-10 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/5">
                                <ChevronLeft className="size-4" />
                            </button>
                            <div className="flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white">
                                {currentPage} / {totalPages}
                            </div>
                            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="size-10 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/5">
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────── Corrections Tab ──────────────────────── */

function CorrectionsTab({ corrections }: { corrections: CorrectionRecord[] }) {
    const statusConfig: Record<string, { label: string; class: string }> = {
        pending: { label: 'Menunggu', class: 'text-amber-400 bg-amber-500/5 border-amber-500/10' },
        approved: { label: 'Disetujui', class: 'text-green-400 bg-green-500/5 border-green-500/10' },
        rejected: { label: 'Ditolak', class: 'text-red-400 bg-red-500/5 border-red-500/10' },
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="size-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <FileEdit className="size-4 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Permintaan Koreksi</h3>
                    <p className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Status pengajuan koreksi kehadiran</p>
                </div>
            </div>

            <div className="space-y-3">
                {corrections.length > 0 ? corrections.map((corr) => {
                    const cfg = statusConfig[corr.status] || statusConfig.pending;
                    return (
                        <div key={corr.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-dynamics/40 uppercase tracking-widest mb-1">
                                        {corr.type === 'check_out' ? 'Koreksi Check-Out' : corr.type === 'check_in' ? 'Koreksi Check-In' : 'Koreksi Penuh'}
                                    </p>
                                    <p className="text-sm font-black text-white">{corr.reason}</p>
                                </div>
                                <div className={cn("px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shrink-0", cfg.class)}>
                                    {cfg.label}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-muted-dynamics/50 font-bold">
                                <span>Diajukan: {corr.submittedAt}</span>
                                {corr.reviewedAt && <span>Ditinjau: {corr.reviewedAt}</span>}
                                {corr.reviewerName && <span>Oleh: {corr.reviewerName}</span>}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-16 text-center opacity-30">
                        <FileEdit className="size-12 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Belum ada koreksi</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────── Insights Tab ──────────────────────── */

function InsightsTab() {
    return (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <WeeklyRhythmPanel className="w-full" />
            <BehavioralInsightsPanel className="w-full" />
        </div>
    );
}
