import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { StatCard } from '@/components/ui/stat-card';
import { PulseItem } from '@/components/ui/pulse-item';
import type { TeamAnalyticsProps, TeamPerformanceProps, TeamMember, PulseFeedItem, EmployeeMetric } from '@/types/attendance';
import {
    Activity,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    ShieldCheck,
    TrendingUp,
    Users,
    X,
    Zap,
    ArrowRight,
    History,
    Download,
} from 'lucide-react';

interface DashboardProps extends TeamAnalyticsProps {
    employeeMetrics?: EmployeeMetric[];
    teamSummary?: { avgPunctuality: number; totalEmployees: number };
}

type Tab = 'overview' | 'performance';

export default function Dashboard({
    stats = { presence: 0, activeNow: 0, lateAbsent: 0 },
    lateMembers = [],
    activeMembers = [],
    pulseFeed = [],
    energyFlux = [30, 45, 80, 70, 40, 30, 15, 10],
    employeeMetrics = [],
    teamSummary = { avgPunctuality: 0, totalEmployees: 0 },
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    return (
        <DashboardLayout title="Dashboard">
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Tab Bar */}
                <div className="px-4 md:px-8 pt-6 pb-0 border-b border-white/5">
                    <div className="flex gap-1">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                            Overview
                        </TabButton>
                        <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
                            Kinerja Tim
                        </TabButton>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'overview' ? (
                        <OverviewTab
                            stats={stats}
                            lateMembers={lateMembers}
                            activeMembers={activeMembers}
                            pulseFeed={pulseFeed}
                            energyFlux={energyFlux}
                        />
                    ) : (
                        <PerformanceTab
                            employeeMetrics={employeeMetrics}
                            teamSummary={teamSummary}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

/* ──────────────────────── Tab Button ──────────────────────── */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'px-6 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-t-xl border-b-2',
                active
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-muted-dynamics/60 border-transparent hover:text-white hover:bg-white/5'
            )}
        >
            {children}
        </button>
    );
}

/* ──────────────────────── Overview Tab ──────────────────────── */

function OverviewTab({
    stats,
    lateMembers,
    activeMembers,
    pulseFeed,
    energyFlux,
}: {
    stats: DashboardProps['stats'];
    lateMembers: TeamMember[];
    activeMembers: TeamMember[];
    pulseFeed: PulseFeedItem[];
    energyFlux: number[];
}) {
    return (
        <div className="flex flex-col lg:flex-row h-full min-h-0">
            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Tim Hari Ini</h2>
                        <p className="text-muted-dynamics text-base md:text-lg">Gambaran kehadiran tim secara real-time.</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Kehadiran" value={`${stats.presence}%`} trend="+4.2%" trendColor="green" />
                    <StatCard label="Hadir Sekarang" value={String(stats.activeNow)} subValue="Anggota" isPrimary />
                    <StatCard label="Terlambat / Absen" value={String(stats.lateAbsent)} subValue="Hari Ini" trend="Perhatian" trendColor="red" />
                </div>

                {/* Late Members */}
                <div className="mb-8">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="size-4 text-orange-400" /> Terlambat / Belum Hadir
                            </h3>
                            <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">{lateMembers.length} Anggota</span>
                        </div>
                        <div className="space-y-4">
                            {lateMembers.length > 0 ? lateMembers.slice(0, 5).map((member) => (
                                <TeamMemberRow key={member.id} name={member.name} time={member.time || 'Late'} img={member.avatar} status={member.status || 'late'} />
                            )) : (
                                <p className="text-xs text-muted-dynamics/60 italic">Semua hadir tepat waktu ✓</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Members List */}
                <div className="mb-8">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap className="size-4 text-primary" /> Sedang Aktif
                            </h3>
                            <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">{activeMembers.length} Anggota</span>
                        </div>
                        <div className="space-y-3">
                            {activeMembers.length > 0 ? activeMembers.slice(0, 8).map((member) => (
                                <TeamMemberRow key={member.id} name={member.name} time={member.time || 'Active'} img={member.avatar} status="active" />
                            )) : (
                                <p className="text-xs text-muted-dynamics/60 italic">Belum ada yang check-in</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pulse Feed Sidebar */}
            <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-header-background flex flex-col shrink-0">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Activity className="size-5 text-primary" /> Aktivitas Terkini
                    </h3>
                </div>
                <div className="flex-1 flex flex-col p-4 space-y-4">
                    {pulseFeed.length > 0 ? pulseFeed.map((item, index) => (
                        <PulseItem
                            key={index}
                            type={item.type}
                            title={item.title}
                            desc={item.desc}
                            action={item.action}
                            members={item.members}
                        />
                    )) : (
                        <PulseItem
                            type="warning"
                            title="Belum Ada Aktivitas"
                            desc="Belum ada aktivitas terkini."
                        />
                    )}

                    {/* Activity Trends */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl mt-auto">
                        <p className="text-[10px] font-bold text-muted-dynamics uppercase tracking-widest mb-4 text-center">Tren Aktivitas (24j)</p>
                        <div className="flex items-end justify-between h-16 gap-1">
                            {energyFlux.map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={cn('w-2 rounded-t transition-all', h > 70 ? 'bg-primary' : 'bg-white/20')}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

/* ──────────────────────── Performance Tab ──────────────────────── */

function PerformanceTab({
    employeeMetrics,
    teamSummary,
}: {
    employeeMetrics: EmployeeMetric[];
    teamSummary: { avgPunctuality: number; totalEmployees: number };
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMetric | null>(null);
    const itemsPerPage = 8;

    const filteredMetrics = useMemo(() => {
        return employeeMetrics.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employeeMetrics, searchTerm]);

    const paginatedMetrics = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMetrics.slice(start, start + itemsPerPage);
    }, [filteredMetrics, currentPage]);

    const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Kinerja <span className="text-primary">Tim</span>
                    </h2>
                    <p className="text-xs font-bold text-muted-dynamics/60 uppercase tracking-widest mt-1">
                        Data kehadiran & ketepatan waktu anggota tim
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="size-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-dynamics uppercase">Rata-rata Ketepatan</p>
                            <p className="text-xl font-black text-white">{teamSummary.avgPunctuality}%</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
                        <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-dynamics uppercase">Total Karyawan</p>
                            <p className="text-xl font-black text-white">{teamSummary.totalEmployees}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <ShieldCheck className="size-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Rekap Karyawan</h3>
                            <p className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Siklus Bulanan</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-dynamics/40" />
                            <input
                                type="text"
                                placeholder="Cari nama..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted-dynamics/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none w-full md:w-72 transition-all font-bold"
                            />
                        </div>
                        <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white flex items-center gap-2 hover:bg-white/10 transition-all">
                            <Filter className="size-4 text-muted-dynamics" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-6 md:mx-0">
                    <table className="w-full text-left border-separate border-spacing-y-2 px-6 md:px-0">
                        <thead>
                            <tr className="text-[10px] font-black text-muted-dynamics/40 uppercase tracking-widest">
                                <th className="px-4 py-2">Karyawan</th>
                                <th className="px-4 py-2">Kehadiran</th>
                                <th className="px-4 py-2 text-center">Ketepatan</th>
                                <th className="px-4 py-2 text-center">Keterlambatan</th>
                                <th className="px-4 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMetrics.map((metric) => (
                                <tr key={metric.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-4 first:rounded-l-2xl bg-white/[0.01] border-y border-white/[0.02] border-l first:border-l-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full border-2 border-white/10 overflow-hidden shrink-0">
                                                <img src={metric.avatar} className="size-full object-cover" alt={metric.name} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{metric.name}</span>
                                                <span className="text-[9px] font-bold text-muted-dynamics/40 uppercase">ID: VEL-{metric.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02]">
                                        <div className="flex flex-col gap-2 w-48">
                                            <div className="flex justify-between text-[10px] font-black italic">
                                                <span className="text-white">{metric.presence.current} / {metric.presence.target} <span className="text-muted-dynamics/40 font-bold not-italic ml-1 uppercase">Hari</span></span>
                                                <span className="text-primary">{metric.presence.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000"
                                                    style={{ width: `${metric.presence.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02] text-center">
                                        <span className={cn(
                                            "text-[10px] font-black px-3 py-1 rounded-lg border",
                                            metric.punctuality.rate >= 90 ? "text-green-400 bg-green-500/5 border-green-500/10" :
                                            metric.punctuality.rate >= 80 ? "text-amber-400 bg-amber-500/5 border-amber-500/10" :
                                            "text-red-400 bg-red-500/5 border-red-500/10"
                                        )}>
                                            {metric.punctuality.rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Zap className={cn("size-3", metric.lateness.count === 0 ? "text-green-500/40" : "text-amber-500")} />
                                            <span className="text-[10px] font-bold text-white uppercase">{metric.lateness.count} Kali</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02] border-r last:rounded-r-2xl text-right">
                                        <button
                                            onClick={() => setSelectedEmployee(metric)}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-primary hover:bg-primary/20 hover:text-white transition-all uppercase tracking-widest"
                                        >
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
                        <p className="text-[10px] font-bold text-muted-dynamics/30 uppercase tracking-widest">
                            {filteredMetrics.length} Karyawan
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="size-10 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 transition-all hover:bg-white/5"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <div className="flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white">
                                Halaman {currentPage} / {totalPages}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="size-10 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 transition-all hover:bg-white/5"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Employee Detail Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md" onClick={() => setSelectedEmployee(null)} />
                    <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-full border-2 border-primary/30 p-1.5 shadow-lg shadow-primary/10">
                                    <img src={selectedEmployee.avatar} className="size-full rounded-full object-cover" alt={selectedEmployee.name} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white tracking-tight">{selectedEmployee.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Riwayat Kehadiran</span>
                                        <span className="size-1 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Siklus Bulanan</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="size-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-muted-dynamics hover:text-white"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="px-8 pt-8 pb-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Kehadiran</p>
                                    <p className="text-xl font-black text-white">{selectedEmployee.presence.percentage}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Ketepatan</p>
                                    <p className="text-xl font-black text-primary">{selectedEmployee.punctuality.rate}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Terlambat</p>
                                    <p className="text-xl font-black text-amber-500">{selectedEmployee.lateness.count}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-3">
                            {selectedEmployee.dailyLogs.length > 0 ? selectedEmployee.dailyLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                            <span className="text-[8px] font-black text-muted-dynamics/40 uppercase leading-none mb-1">TGL</span>
                                            <span className="text-xs font-black text-white tracking-widest leading-none">{log.date.split(' ')[0]}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-white">{log.checkIn}</span>
                                            <ArrowRight className="size-3 text-muted-dynamics/30" />
                                            <span className="text-sm font-bold text-muted-dynamics">{log.checkOut || '--:--'}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                                        log.status === 'on_time' ? "text-green-400 bg-green-500/5 border-green-500/10" : "text-amber-400 bg-amber-500/5 border-amber-500/10"
                                    )}>
                                        {log.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center opacity-20">
                                    <History className="size-12 mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Belum ada riwayat</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-white/5 flex justify-end bg-white/[0.01]">
                            <button className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                                <Download className="size-4" /> Ekspor Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────── Helper Components ──────────────────────── */

function TeamMemberRow({ name, time, img, status }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-full border border-white/10 overflow-hidden">
                    <img src={img} className="size-full object-cover" alt={name} />
                </div>
                <div>
                    <p className="text-xs font-bold text-white mb-0.5">{name}</p>
                    <p className="text-[10px] text-muted-dynamics/60 font-medium uppercase tracking-tighter">{time}</p>
                </div>
            </div>
            <div className={cn(
                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                status === 'late' ? "bg-orange-500/10 text-orange-400" :
                status === 'absent' ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
            )}>
                {status === 'late' ? 'Terlambat' : status === 'absent' ? 'Absen' : 'Aktif'}
            </div>
        </div>
    );
}
