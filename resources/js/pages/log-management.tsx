import DashboardLayout from '@/layouts/app-dashboard-layout';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    FileEdit,
    Loader2,
    Search,
    ShieldCheck,
    X,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import type { LogManagementProps, CorrectionData, AuditLogItem } from '@/types/attendance';

interface PageProps extends LogManagementProps {}

export default function LogManagement({
    corrections = [],
    totalPending = 0,
}: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filteredCorrections = useMemo(() => {
        return corrections.filter(c => {
            const matchesSearch =
                c.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.requestCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [corrections, searchTerm, filterStatus]);

    return (
        <DashboardLayout title="Koreksi">
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Header */}
                <div className="p-4 md:p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                Pusat <span className="text-primary">Koreksi</span>
                            </h1>
                            <p className="text-xs font-bold text-muted-dynamics/60 uppercase tracking-widest mt-1">
                                {totalPending > 0 ? `${totalPending} permintaan menunggu tinjauan` : 'Semua pengajuan sudah ditinjau'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-dynamics/40" />
                                <input
                                    type="text"
                                    placeholder="Cari nama / kode..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted-dynamics/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none w-full md:w-60 transition-all font-bold"
                                />
                            </div>
                            <div className="flex gap-1">
                                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={cn(
                                            'px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                                            filterStatus === status
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : 'bg-white/5 text-muted-dynamics/40 border-white/5 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {status === 'all' ? 'Semua' : status === 'pending' ? 'Menunggu' : status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Correction List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-8">
                    <div className="space-y-3">
                        {filteredCorrections.length > 0 ? filteredCorrections.map((correction) => (
                            <CorrectionRow
                                key={correction.id}
                                correction={correction}
                                expanded={expandedId === correction.id}
                                onToggle={() => setExpandedId(expandedId === correction.id ? null : correction.id)}
                            />
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <FileEdit className="size-12 mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-[0.2em]">
                                    {searchTerm || filterStatus !== 'all' ? 'Tidak ada hasil' : 'Belum ada pengajuan koreksi'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

/* ──────────────────────── Correction Row ──────────────────────── */

function CorrectionRow({
    correction,
    expanded,
    onToggle,
}: {
    correction: CorrectionData;
    expanded: boolean;
    onToggle: () => void;
}) {
    const approveForm = useForm({});
    const rejectForm = useForm({});
    const isProcessing = approveForm.processing || rejectForm.processing;

    const handleApprove = (e: React.MouseEvent) => {
        e.stopPropagation();
        approveForm.post(route('corrections.approve', { correction: correction.id }), {
            preserveScroll: true,
        });
    };

    const handleReject = (e: React.MouseEvent) => {
        e.stopPropagation();
        rejectForm.post(route('corrections.reject', { correction: correction.id }), {
            preserveScroll: true,
        });
    };

    const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
        pending: { label: 'Menunggu', class: 'text-amber-400 bg-amber-500/5 border-amber-500/10', icon: Clock },
        approved: { label: 'Disetujui', class: 'text-green-400 bg-green-500/5 border-green-500/10', icon: CheckCircle2 },
        rejected: { label: 'Ditolak', class: 'text-red-400 bg-red-500/5 border-red-500/10', icon: AlertCircle },
    };

    const cfg = statusConfig[correction.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;

    return (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden transition-all hover:bg-white/[0.03]">
            {/* Summary Row */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left group"
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="size-10 rounded-full border border-white/10 overflow-hidden shrink-0">
                        <img
                            src={correction.requester.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${correction.requester.name}`}
                            className="size-full object-cover"
                            alt={correction.requester.name}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-black text-white group-hover:text-primary transition-colors truncate">{correction.requester.name}</span>
                            <span className="text-[9px] font-bold text-muted-dynamics/30 uppercase tracking-widest shrink-0">{correction.requestCode}</span>
                        </div>
                        <p className="text-[10px] text-muted-dynamics/50 font-bold truncate">{correction.reason}</p>
                    </div>

                    {/* Time Diff */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase">Asli</p>
                            <p className="text-xs font-black text-muted-dynamics/50 line-through">{correction.originalTime}</p>
                        </div>
                        <span className="text-muted-dynamics/20">→</span>
                        <div className="text-left">
                            <p className="text-[9px] font-bold text-primary/60 uppercase">Diajukan</p>
                            <p className="text-xs font-black text-white">{correction.proposedTime}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={cn("px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0", cfg.class)}>
                        <StatusIcon className="size-3" />
                        {cfg.label}
                    </div>

                    {/* Toggle */}
                    <div className="shrink-0 ml-2">
                        {expanded ? <ChevronUp className="size-4 text-muted-dynamics/30" /> : <ChevronDown className="size-4 text-muted-dynamics/30" />}
                    </div>
                </div>
            </button>

            {/* Expanded Detail */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/[0.03] pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Detail Info */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest mb-1">Alasan Pengajuan</p>
                                <p className="text-xs text-white font-medium">{correction.reason}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest mb-1">Diajukan</p>
                                    <p className="text-xs text-muted-dynamics font-bold">{correction.submittedAt}</p>
                                </div>
                                {correction.reviewedAt && (
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest mb-1">Ditinjau</p>
                                        <p className="text-xs text-muted-dynamics font-bold">{correction.reviewedAt}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Log */}
                        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.03]">
                            <p className="text-[9px] font-bold text-muted-dynamics/40 uppercase tracking-widest mb-3">Riwayat Audit</p>
                            <div className="space-y-2">
                                {correction.auditLog?.length > 0 ? correction.auditLog.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 py-1">
                                        <div className={cn(
                                            'size-1.5 rounded-full shrink-0',
                                            item.status === 'mismatch' ? 'bg-orange-500' :
                                            item.status === 'pending' ? 'bg-slate-600' : 'bg-primary'
                                        )} />
                                        <span className="text-[10px] font-bold text-muted-dynamics/40 w-12 shrink-0">{item.time}</span>
                                        <span className="text-[10px] font-bold text-muted-dynamics/60">{item.event}</span>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-muted-dynamics/40 italic">Belum ada riwayat.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {correction.status === 'pending' && (
                        <div className="flex gap-3 mt-5 pt-5 border-t border-white/[0.03]">
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="px-6 py-3 rounded-xl border border-white/10 text-muted-dynamics hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                            >
                                {rejectForm.processing ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />} Tolak
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="px-8 py-3 rounded-xl bg-primary text-background-dark hover:shadow-[0_0_25px_rgba(19,200,236,0.3)] transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                            >
                                {approveForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Setujui
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
