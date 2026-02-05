import { Head, router } from '@inertiajs/react';
import { Check, X, Users, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/layouts/app-dashboard-layout';

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

export default function UsersManagement({ pendingUsers, activeUsers }: Props) {
    const handleApprove = (userId: number) => {
        router.post(`/admin/users/${userId}/approve`);
    };

    const handleReject = (userId: number) => {
        if (confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
            router.post(`/admin/users/${userId}/reject`);
        }
    };

    return (
        <DashboardLayout title="User Management">

            <div className="p-6 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground text-sm">
                        Approve or reject pending user registrations
                    </p>
                </div>

                {/* Pending Users Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Pending Approval ({pendingUsers.length})
                        </h2>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-8 text-center">
                            <UserCheck className="size-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No pending registrations</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Registered</th>
                                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-muted-foreground">{user.email}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-muted-foreground">
                                                    {user.role?.display_name || 'Employee'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-muted-foreground text-sm">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(user.id)}
                                                        className="gap-1"
                                                    >
                                                        <Check className="size-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(user.id)}
                                                        className="gap-1"
                                                    >
                                                        <X className="size-4" />
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
                </div>

                {/* Active Users Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="size-5 text-green-500" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Active Users ({activeUsers.length})
                        </h2>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activeUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            No active users
                                        </td>
                                    </tr>
                                ) : (
                                    activeUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-muted-foreground">{user.email}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-muted-foreground">
                                                    {user.role?.display_name || 'Employee'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
