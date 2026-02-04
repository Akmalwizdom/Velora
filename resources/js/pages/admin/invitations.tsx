import { Form, Head, Link, router } from '@inertiajs/react';
import { Mail, MoreHorizontal, Plus, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/layouts/app-dashboard-layout';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Team {
    id: number;
    name: string;
}

interface Invitation {
    id: number;
    email: string;
    status: 'pending' | 'accepted' | 'expired';
    expires_at: string;
    created_at: string;
    role: Role;
    inviter: {
        id: number;
        name: string;
    };
}

interface Props {
    invitations: {
        data: Invitation[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    roles: Role[];
    teams: Team[];
}

export default function Invitations({ invitations, roles, teams }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');

    const handleResend = (id: number) => {
        router.post(`/admin/invitations/${id}/resend`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to cancel this invitation?')) {
            router.delete(`/admin/invitations/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
            expired: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    return (
        <DashboardLayout>
            <Head title="Manage Invitations" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Invitations</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage team member invitations
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="size-4" />
                                Send Invitation
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                    Send an invitation to join your organization.
                                </DialogDescription>
                            </DialogHeader>

                            <Form
                                action="/admin/invitations"
                                method="post"
                                onSuccess={() => setIsDialogOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="colleague@company.com"
                                                required
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role_id">Role</Label>
                                            <Select
                                                name="role_id"
                                                value={selectedRoleId}
                                                onValueChange={setSelectedRoleId}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={String(role.id)}>
                                                            {role.display_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="role_id" value={selectedRoleId} />
                                            {errors.role_id && (
                                                <p className="text-sm text-destructive">{errors.role_id}</p>
                                            )}
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing} className="gap-2">
                                                <UserPlus className="size-4" />
                                                Send Invitation
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Invitations Table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invited By</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expires</th>
                                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invitations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        <Mail className="size-12 mx-auto mb-4 opacity-50" />
                                        <p>No invitations yet</p>
                                        <p className="text-sm">Send your first invitation to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                invitations.data.map((invitation) => (
                                    <tr key={invitation.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <span className="font-medium text-foreground">{invitation.email}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-muted-foreground">{invitation.role.display_name}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(invitation.status)}`}>
                                                {invitation.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-muted-foreground">{invitation.inviter.name}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-muted-foreground text-sm">{invitation.expires_at}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {invitation.status === 'pending' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleResend(invitation.id)}>
                                                            <RefreshCw className="size-4 mr-2" />
                                                            Resend
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(invitation.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Cancel
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
