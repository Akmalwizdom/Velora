import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { StatCard } from '@/components/ui/stat-card';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Clock, 
    Plus, 
    Edit2, 
    Trash2, 
    UserPlus, 
    Calendar,
    Users,
    CheckCircle2,
    AlertCircle,
    Info,
    ChevronRight,
    MapPin,
    ArrowRight,
    MoreVertical
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkSchedule {
    id: number;
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    break_duration_minutes: number;
    work_days: string[];
    late_tolerance_minutes: number;
    is_active: boolean;
    is_default: boolean;
    description: string | null;
    total_users: number;
    formatted_start: string;
    formatted_end: string;
    working_hours: number;
    days_display: string[];
}

interface Team {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    schedules: WorkSchedule[];
    teams: Team[];
    users: User[];
    stats: {
        total: number;
        active: number;
        assigned: number;
    };
}

const DAY_OPTIONS = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' },
];

export default function WorkSchedules({ schedules, teams, users, stats }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const createForm = useForm({
        name: '',
        code: '',
        start_time: '09:00',
        end_time: '18:00',
        break_duration_minutes: 60,
        work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[],
        late_tolerance_minutes: 15,
        is_default: false,
        description: '',
    });

    const assignForm = useForm({
        team_ids: [] as number[],
        user_ids: [] as number[],
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: '',
    });

    console.log('Current schedules in prop:', schedules);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure time format is exactly HH:mm (removing seconds if browser added them)
        const start = createForm.data.start_time.substring(0, 5);
        const end = createForm.data.end_time.substring(0, 5);
        
        console.log('Preparing to submit schedule:', { ...createForm.data, start_time: start, end_time: end });
        
        createForm.transform((data) => ({
            ...data,
            start_time: start,
            end_time: end
        }));

        if (selectedSchedule) {
            createForm.put(route('admin.work-schedules.update', selectedSchedule.id), {
                onSuccess: () => {
                    console.log('Schedule updated successfully');
                    setIsCreateModalOpen(false);
                    createForm.reset();
                    setSelectedSchedule(null);
                },
                onError: (err: any) => console.error('Update failed:', err),
            });
        } else {
            createForm.post(route('admin.work-schedules.store'), {
                onSuccess: () => {
                    console.log('Schedule created successfully');
                    setIsCreateModalOpen(false);
                    createForm.reset();
                },
                onError: (err: any) => console.error('Store failed:', err),
            });
        }
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchedule) return;
        assignForm.post(route('admin.work-schedules.assign', selectedSchedule.id), {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                assignForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this schedule?')) {
            router.delete(route('admin.work-schedules.destroy', id), {
                onSuccess: () => console.log('Schedule deleted successfully'),
            });
        }
    };

    const toggleDay = (day: string) => {
        const currentDays = createForm.data.work_days;
        if (currentDays.includes(day)) {
            createForm.setData('work_days', currentDays.filter(d => d !== day));
        } else {
            createForm.setData('work_days', [...currentDays, day]);
        }
    };

    const strtoupper = (str: string) => str.toUpperCase();

    // Calculate live working hours for the modal
    const calculateLiveHours = () => {
        try {
            const start = createForm.data.start_time;
            const end = createForm.data.end_time;
            if (!start || !end) return 0;

            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            
            let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
            if (totalMinutes < 0) totalMinutes += 24 * 60; // Cross midnight
            
            const workMinutes = totalMinutes - createForm.data.break_duration_minutes;
            return Math.max(0, parseFloat((workMinutes / 60).toFixed(1)));
        } catch (e) {
            return 0;
        }
    };

    const liveHours = calculateLiveHours();

    // Presets helper
    const applyPreset = (type: 'office' | 'morning' | 'flexible') => {
        if (type === 'office') {
            createForm.setData({
                ...createForm.data,
                start_time: '09:00',
                end_time: '18:00',
                break_duration_minutes: 60,
                work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            });
        }
    };

    return (
        <DashboardLayout title="Work Schedules">
            <Head title="Work Schedule Management" />

            <div className="p-6 space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Clock className="size-8 text-primary" />
                            Work Schedule Management
                        </h1>
                        <p className="text-muted-dynamics mt-1 text-lg">
                            Configure organization work hours, shifts, and team assignments.
                        </p>
                    </div>
                    
                    <Dialog 
                        open={isCreateModalOpen} 
                        onOpenChange={(open) => {
                            setIsCreateModalOpen(open);
                            if (!open) {
                                setSelectedSchedule(null);
                                createForm.reset();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-background-dark font-bold gap-2 rounded-full px-6 transition-all hover:scale-105 active:scale-95">
                                <Plus className="size-5" />
                                Create Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] bg-background-dark/95 backdrop-blur-xl border-white/10 text-white overflow-hidden p-0 rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            
                            <DialogHeader className="p-6 pb-0">
                                <DialogTitle className="text-3xl font-bold tracking-tight">Set Schedule</DialogTitle>
                                <DialogDescription className="text-muted-dynamics text-base">
                                    Templates define how and when your team works.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreateSubmit} className="space-y-6 pt-2">
                                <div className="px-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pb-6 pt-2">
                                    {/* Section 1: Basic Identity */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Info className="size-3" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest">General Info</h3>
                                        </div>
                                        
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs text-muted-dynamics font-bold">SCHEDULE NAME</Label>
                                                <Input 
                                                    id="name" 
                                                    value={createForm.data.name}
                                                    onChange={e => createForm.setData('name', e.target.value)}
                                                    placeholder="e.g. Regular Office Hours" 
                                                    className={cn(
                                                        "bg-white/[0.03] border-white/10 h-12 text-lg focus:ring-primary/20",
                                                        createForm.errors.name && "border-red-500/50 ring-1 ring-red-500/20"
                                                    )}
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-[11px] text-red-400 font-bold animate-pulse">{createForm.errors.name}</p>
                                                )}
                                            </div>

                                            {showAdvanced ? (
                                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                    <Label htmlFor="code" className="text-xs text-muted-dynamics font-bold">SYSTEM CODE (OPTIONAL)</Label>
                                                    <Input 
                                                        id="code" 
                                                        value={createForm.data.code}
                                                        onChange={e => createForm.setData('code', strtoupper(e.target.value))}
                                                        placeholder="AUTO-GENERATED" 
                                                        className={cn(
                                                            "bg-white/[0.03] border-white/10 font-mono",
                                                            createForm.errors.code && "border-red-500/50 ring-1 ring-red-500/20"
                                                        )}
                                                    />
                                                    {createForm.errors.code && (
                                                        <p className="text-[10px] text-red-400 font-bold">{createForm.errors.code}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAdvanced(true)}
                                                    className="text-[10px] text-muted-dynamics hover:text-white transition-colors flex items-center gap-1 w-fit"
                                                >
                                                    <MoreVertical className="size-3" />
                                                    Show technical fields
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 2: Timing */}
                                    <div className="space-y-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary">
                                                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Clock className="size-3" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest">Timing</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => applyPreset('office')}
                                                    className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                                >
                                                    9-5 Preset
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="start_time" className="text-[10px] text-muted-dynamics font-black tracking-widest uppercase">Start Work</Label>
                                                <Input 
                                                    id="start_time" 
                                                    type="time"
                                                    value={createForm.data.start_time}
                                                    onChange={e => createForm.setData('start_time', e.target.value)}
                                                    className={cn(
                                                        "bg-white/5 border-white/10 h-10",
                                                        createForm.errors.start_time && "border-red-500/50 ring-1 ring-red-500/20"
                                                    )}
                                                />
                                                {createForm.errors.start_time && (
                                                    <p className="text-[10px] text-red-400 font-bold">{createForm.errors.start_time}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="end_time" className="text-[10px] text-muted-dynamics font-black tracking-widest uppercase">End Work</Label>
                                                <Input 
                                                    id="end_time" 
                                                    type="time"
                                                    value={createForm.data.end_time}
                                                    onChange={e => createForm.setData('end_time', e.target.value)}
                                                    className={cn(
                                                        "bg-white/5 border-white/10 h-10",
                                                        createForm.errors.end_time && "border-red-500/50 ring-1 ring-red-500/20"
                                                    )}
                                                />
                                                {createForm.errors.end_time && (
                                                    <p className="text-[10px] text-red-400 font-bold">{createForm.errors.end_time}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="break" className="text-[10px] text-muted-dynamics font-black tracking-widest uppercase text-center block">Break Duration</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        id="break" 
                                                        type="number"
                                                        value={createForm.data.break_duration_minutes}
                                                        onChange={e => createForm.setData('break_duration_minutes', parseInt(e.target.value))}
                                                        className="bg-white/5 border-white/10 h-10"
                                                    />
                                                    <span className="text-xs text-muted-dynamics font-bold">Min</span>
                                                </div>
                                            </div>
                                            <div className="bg-primary/5 rounded-2xl flex flex-col items-center justify-center border border-primary/10">
                                                <span className="text-[10px] text-primary/70 font-black tracking-tighter uppercase">Total Work Hours</span>
                                                <span className="text-2xl font-black text-primary">{liveHours}H</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Work Days */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Calendar className="size-3" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest">Work Days</h3>
                                        </div>
                                        
                                        <div className="flex justify-between items-center p-2 rounded-2xl bg-white/[0.03] border border-white/10">
                                            {DAY_OPTIONS.map(day => {
                                                const isActive = createForm.data.work_days.includes(day.value);
                                                return (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleDay(day.value)}
                                                        className={cn(
                                                            "size-10 rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2",
                                                            isActive
                                                                ? "bg-primary border-primary text-background-dark scale-110 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                                                : "bg-transparent border-white/5 text-muted-dynamics hover:border-white/20",
                                                            createForm.errors.work_days && "border-red-500/30"
                                                        )}
                                                    >
                                                        {day.label.substring(0, 1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {createForm.errors.work_days && (
                                            <p className="text-[10px] text-red-400 font-bold px-2">{createForm.errors.work_days}</p>
                                        )}
                                    </div>

                                    {/* Section 4: Rules */}
                                    <div className="grid grid-cols-2 gap-4 items-center pt-2">
                                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/20 transition-colors">
                                            <Checkbox 
                                                id="is_default" 
                                                checked={createForm.data.is_default}
                                                onCheckedChange={(checked) => createForm.setData('is_default', !!checked)}
                                                className="size-5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <Label htmlFor="is_default" className="text-xs font-bold whitespace-nowrap cursor-pointer">Set as Default</Label>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <Label htmlFor="late" className="text-[10px] text-muted-dynamics font-black flex items-center gap-1">
                                                LATE TOLERANCE
                                                <AlertCircle className="size-3" />
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    id="late" 
                                                    type="number"
                                                    value={createForm.data.late_tolerance_minutes}
                                                    onChange={e => createForm.setData('late_tolerance_minutes', parseInt(e.target.value))}
                                                    className="bg-white/5 border-white/10 h-8 text-xs text-primary font-bold"
                                                />
                                                <span className="text-[10px] text-muted-dynamics font-black">MIN</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="bg-white/[0.02] p-6 border-t border-white/5 mt-0 rounded-b-3xl">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="text-muted-dynamics hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={createForm.processing} 
                                        className="bg-primary text-background-dark font-black px-10 rounded-full h-12 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] hover:scale-105 transition-transform"
                                    >
                                        {createForm.processing ? 'Saving...' : 'Finish Setup'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard 
                        label="Total Templates" 
                        value={stats.total} 
                        isPrimary 
                    />
                    <StatCard 
                        label="Active Schedules" 
                        value={stats.active} 
                    />
                    <StatCard 
                        label="Assigned Force" 
                        value={stats.assigned}
                        subValue="users"
                    />
                </div>

                {/* Schedules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules.map((schedule) => (
                        <GlassPanel key={schedule.id} className="group overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500">
                            <div className="p-6 space-y-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                                {schedule.name}
                                            </h3>
                                            {schedule.is_default && (
                                                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-black tracking-widest shrink-0">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-dynamics font-mono uppercase tracking-tighter mt-1">
                                            {schedule.code}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-8 text-muted-dynamics hover:text-primary hover:bg-white/5"
                                            onClick={() => {
                                                createForm.setData({
                                                    name: schedule.name,
                                                    code: schedule.code,
                                                    start_time: schedule.start_time.substring(0, 5),
                                                    end_time: schedule.end_time.substring(0, 5),
                                                    break_duration_minutes: schedule.break_duration_minutes,
                                                    work_days: schedule.work_days,
                                                    late_tolerance_minutes: schedule.late_tolerance_minutes,
                                                    is_default: schedule.is_default,
                                                    description: schedule.description || '',
                                                });
                                                setSelectedSchedule(schedule);
                                                setIsCreateModalOpen(true);
                                                setShowAdvanced(false);
                                            }}
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-8 text-muted-dynamics hover:text-white hover:bg-white/5"
                                            onClick={() => {
                                                setSelectedSchedule(schedule);
                                                setIsAssignModalOpen(true);
                                                assignForm.reset();
                                            }}
                                        >
                                            <UserPlus className="size-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-8 text-muted-dynamics hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(schedule.id)}
                                            disabled={schedule.is_default}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 py-2">
                                    <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5 group-hover:border-primary/10 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-dynamics font-bold">Standard Hours</p>
                                            <p className="text-lg font-bold text-white flex items-center gap-2">
                                                {schedule.formatted_start} <ArrowRight className="size-3 text-primary" /> {schedule.formatted_end}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-dynamics font-bold text-right">Duration</p>
                                            <p className="text-lg font-bold text-primary">{schedule.working_hours}H</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {schedule.days_display.map(day => (
                                            <span key={day} className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-bold text-muted-dynamics uppercase">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-muted-dynamics">
                                        <Users className="size-4" />
                                        <span className="text-sm font-bold text-white">{schedule.total_users}</span>
                                        <span className="text-xs">Team Members</span>
                                    </div>
                                    <Button variant="ghost" className="h-8 text-xs gap-1.5 hover:text-primary hover:bg-primary/5">
                                        View Details
                                        <ChevronRight className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        </GlassPanel>
                    ))}

                    {schedules.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                                <Calendar className="size-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">No schedules found</h3>
                                <p className="text-muted-dynamics">Start by creating your first work schedule template.</p>
                            </div>
                            <Button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="size-4 mr-2" />
                                Create First Template
                            </Button>
                        </div>
                    )}
                </div>

                {/* Assign Modal */}
                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                    <DialogContent className="sm:max-w-[450px] bg-background-dark/95 backdrop-blur-xl border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Assign Schedule</DialogTitle>
                            <DialogDescription className="text-muted-dynamics font-bold">
                                Assign <span className="text-primary">{selectedSchedule?.name}</span> to teams or individuals.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleAssignSubmit} className="space-y-6 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Effective Date</Label>
                                    <Input 
                                        type="date" 
                                        value={assignForm.data.effective_from}
                                        onChange={e => assignForm.setData('effective_from', e.target.value)}
                                        className="bg-white/5 border-white/10"
                                    />
                                    <p className="text-[10px] text-muted-dynamic">When this schedule starts applying to the selected force.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Teams</Label>
                                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {teams.map(team => (
                                            <div key={team.id} className="flex items-center space-x-2 p-2 rounded hover:bg-white/5 transition-colors">
                                                <Checkbox 
                                                    id={`team-${team.id}`}
                                                    checked={assignForm.data.team_ids.includes(team.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = assignForm.data.team_ids;
                                                        assignForm.setData('team_ids', checked ? [...current, team.id] : current.filter(id => id !== team.id));
                                                    }}
                                                />
                                                <Label htmlFor={`team-${team.id}`} className="flex-1 cursor-pointer">{team.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Individual Overrides</Label>
                                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {users.map(user => (
                                            <div key={user.id} className="flex items-center space-x-2 p-2 rounded hover:bg-white/5 transition-colors">
                                                <Checkbox 
                                                    id={`user-${user.id}`}
                                                    checked={assignForm.data.user_ids.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = assignForm.data.user_ids;
                                                        assignForm.setData('user_ids', checked ? [...current, user.id] : current.filter(id => id !== user.id));
                                                    }}
                                                />
                                                <div className="flex-1 cursor-pointer">
                                                    <Label htmlFor={`user-${user.id}`} className="block">{user.name}</Label>
                                                    <span className="text-[10px] text-muted-dynamics leading-none block">{user.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={assignForm.processing} className="bg-primary text-background-dark font-bold px-8">Confirm Assignment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

// Utility to match existing design patterns
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

// Mock route function if not globally available, though it should be
const route = (name: string, param?: any) => {
    if (name === 'admin.work-schedules.store') return '/admin/work-schedules';
    if (name === 'admin.work-schedules.update') return `/admin/work-schedules/${param}`;
    if (name === 'admin.work-schedules.destroy') return `/admin/work-schedules/${param}`;
    if (name === 'admin.work-schedules.assign') return `/admin/work-schedules/${param}/assign`;
    return '#';
};
