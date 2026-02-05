import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { StatCard } from '@/components/ui/stat-card';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Check, 
    ChevronRight, 
    Clock, 
    Search, 
    ShieldCheck, 
    Users, 
    Users2,
    X 
} from 'lucide-react';
import React, { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    status: 'pending' | 'active' | 'suspended';
    created_at: string;
    role: {
        id: number;
        name: string;
        display_name: string;
    } | null;
}

interface Props {
    pendingUsers: User[];
    activeUsers: User[];
}

export default function UserManagement({ pendingUsers, activeUsers }: Props) {
    const { post, processing } = useForm();
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (userId: number) => {
        post(`/admin/users/${userId}/approve`);
    };

    const handleReject = (userId: number) => {
        if (confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
            post(`/admin/users/${userId}/reject`);
        }
    };

    const filteredActiveUsers = activeUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <DashboardLayout title="User Management">
            <Head title="User Management" />

            <div className="p-6 space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Users2 className="size-8 text-primary" />
                            User Management
                        </h1>
                        <p className="text-muted-dynamics mt-1 text-lg">
                            Manage user access, approvals, and system permissions.
                        </p>
                    </div>
                    
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-dynamics group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-full md:w-64 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard 
                        label="Total Users" 
                        value={activeUsers.length + pendingUsers.length} 
                        isPrimary 
                    />
                    <StatCard 
                        label="Pending Approvals" 
                        value={pendingUsers.length} 
                        trend={pendingUsers.length > 0 ? 'Needs Action' : undefined}
                        trendColor="red"
                    />
                    <StatCard 
                        label="Active Members" 
                        value={activeUsers.length} 
                    />
                </div>

                {/* Pending Table */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Clock className="size-5 text-orange-400" />
                        <h2 className="text-xl font-bold text-white">Pending Approvals</h2>
                        <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
                            {pendingUsers.length}
                        </Badge>
                    </div>

                    <GlassPanel intensity="low" className="overflow-hidden border-white/5 shadow-2xl">
                        {pendingUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="size-12 text-white/10 mx-auto mb-4" />
                                <p className="text-muted-dynamics text-lg">No pending registrations at the moment.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">Role Requested</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">Registration Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pendingUsers.map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                                            <p className="text-xs text-muted-dynamics mt-1">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="capitalize border-white/10 text-white/70">
                                                        {user.role?.display_name || 'Employee'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-dynamics">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            onClick={() => handleApprove(user.id)}
                                                            disabled={processing}
                                                            size="sm"
                                                            className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/30 gap-1.5 h-8"
                                                        >
                                                            <Check className="size-3.5" />
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleReject(user.id)}
                                                            disabled={processing}
                                                            size="sm"
                                                            variant="destructive"
                                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 gap-1.5 h-8"
                                                        >
                                                            <X className="size-3.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </GlassPanel>
                </section>

                {/* Active Table */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ShieldCheck className="size-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">Active Users</h2>
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                            {filteredActiveUsers.length}
                        </Badge>
                    </div>

                    <GlassPanel intensity="low" className="overflow-hidden border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">Active Member</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">Access Control</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-dynamics uppercase tracking-wider text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredActiveUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                                        <p className="text-xs text-muted-dynamics mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary/80 border-primary/10 capitalize">
                                                        {user.role?.display_name || 'Employee'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                    <span className="text-xs font-bold text-green-400 uppercase tracking-tighter">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="icon" variant="ghost" className="text-muted-dynamics hover:text-white hover:bg-white/5">
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredActiveUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-dynamics italic">
                                                No matches found for "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassPanel>
                </section>
            </div>
        </DashboardLayout>
    );
}
