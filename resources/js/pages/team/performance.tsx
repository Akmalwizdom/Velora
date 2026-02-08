import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import type { TeamPerformanceProps, EmployeeMetric } from '@/types/attendance';
import { 
    Users, 
    Search, 
    ChevronRight, 
    ChevronLeft, 
    X, 
    Download, 
    History, 
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Zap,
    Filter
} from 'lucide-react';

export default function TeamPerformance({
    employeeMetrics = [],
    teamSummary = { avgPunctuality: 0, totalEmployees: 0 }
}: TeamPerformanceProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMetric | null>(null);
    const itemsPerPage = 8;

    // Filtered and Paginated Metrics
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <DashboardLayout title="Team Performance">
            <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Team <span className="text-primary">Performance</span>
                        </h2>
                        <p className="text-xs font-bold text-muted-dynamics/60 uppercase tracking-widest mt-1">
                            Deep accountability & data telemetry
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-dynamics uppercase">Avg. Punctuality</p>
                                <p className="text-xl font-black text-white">{teamSummary.avgPunctuality}%</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Users className="size-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-dynamics uppercase">Employees</p>
                                <p className="text-xl font-black text-white">{teamSummary.totalEmployees}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <ShieldCheck className="size-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Employee Records</h3>
                                <p className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Monthly Cycle Analysis</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-dynamics/40" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
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
                                    <th className="px-4 py-2">Employee Identity</th>
                                    <th className="px-4 py-2">Attendance Progress</th>
                                    <th className="px-4 py-2 text-center">Punctuality</th>
                                    <th className="px-4 py-2 text-center">Incidents</th>
                                    <th className="px-4 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMetrics.map((metric) => (
                                    <tr key={metric.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4 first:rounded-l-2xl last:rounded-r-2xl bg-white/[0.01] border-y border-white/[0.02] border-l first:border-l-white/[0.02]">
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
                                                    <span className="text-white">{metric.presence.current} / {metric.presence.target} <span className="text-muted-dynamics/40 font-bold not-italic ml-1 uppercase Tracking-tighter">Days</span></span>
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
                                            <div className="inline-flex flex-col items-center">
                                                <span className={cn(
                                                    "text-[10px] font-black px-3 py-1 rounded-lg border",
                                                    metric.punctuality.rate >= 90 ? "text-green-400 bg-green-500/5 border-green-500/10" :
                                                    metric.punctuality.rate >= 80 ? "text-amber-400 bg-amber-500/5 border-amber-500/10" :
                                                    "text-red-400 bg-red-500/5 border-red-500/10"
                                                )}>
                                                    {metric.punctuality.rate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02] text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Zap className={cn(
                                                    "size-3",
                                                    metric.lateness.count === 0 ? "text-green-500/40" : "text-amber-500"
                                                )} />
                                                <span className="text-[10px] font-bold text-white uppercase">{metric.lateness.count} Late</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white/[0.01] border-y border-white/[0.02] border-r last:rounded-r-2xl last:border-r-white/[0.02] text-right">
                                            <button 
                                                onClick={() => setSelectedEmployee(metric)}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-primary hover:bg-primary/20 hover:text-white transition-all uppercase tracking-widest"
                                            >
                                                View Logs
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
                                Processing {filteredMetrics.length} Active Profiles
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
                                    PAGE {currentPage} / {totalPages}
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
            </div>

            {/* Accountability Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md" onClick={() => setSelectedEmployee(null)} />
                    <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-full border-2 border-primary/30 p-1.5 shadow-lg shadow-primary/10">
                                    <img src={selectedEmployee.avatar} className="size-full rounded-full object-cover" alt={selectedEmployee.name} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white tracking-tight">{selectedEmployee.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Core Accountability Log</span>
                                        <span className="size-1 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">Monthly Cycle</span>
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

                        {/* Modal Metrics */}
                        <div className="px-8 pt-8 pb-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Presence Rate</p>
                                    <p className="text-xl font-black text-white">{selectedEmployee.presence.percentage}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Punctuality</p>
                                    <p className="text-xl font-black text-primary">{selectedEmployee.punctuality.rate}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase mb-2">Total Lateness</p>
                                    <p className="text-xl font-black text-amber-500">{selectedEmployee.lateness.count}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Logs Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-3">
                            {selectedEmployee.dailyLogs.length > 0 ? selectedEmployee.dailyLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                            <span className="text-[8px] font-black text-muted-dynamics/40 uppercase leading-none mb-1">DATE</span>
                                            <span className="text-xs font-black text-white tracking-widest leading-none">{log.date.split(' ')[0]}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-white">{log.checkIn}</span>
                                                <ArrowRight className="size-3 text-muted-dynamics/30" />
                                                <span className="text-sm font-bold text-muted-dynamics">{log.checkOut || '--:--'}</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-muted-dynamics/30 uppercase tracking-wide mt-1">{log.location}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                                        log.status === 'on_time' ? "text-green-400 bg-green-500/5 border-green-500/10" : "text-amber-400 bg-amber-500/5 border-amber-500/10"
                                    )}>
                                        {log.status.replace('_', ' ')}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center opacity-20">
                                    <History className="size-12 mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">No history captured</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-white/5 flex justify-end bg-white/[0.01]">
                            <button className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                                <Download className="size-4" /> Export Data Packet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
