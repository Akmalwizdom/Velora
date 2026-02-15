import { Link, usePage } from '@inertiajs/react';
import { Clock, LayoutGrid, Monitor, Shield, User, Users, Zap } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, User as UserType } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: UserType & { role_name?: string } } }>().props;
    const role = auth.user.role_name;

    const isManagerOrAdmin = role === 'admin' || role === 'manager';

    const mainNavItems: NavItem[] = [
        // QR Station — admin/manager only
        ...(isManagerOrAdmin
            ? [{ title: 'Station Absensi', href: '/qr/display', icon: Monitor }]
            : []),
        // Absensi — all roles
        { title: 'Absensi', href: '/attendance-hub', icon: Zap },
        // Dashboard — admin/manager only
        ...(isManagerOrAdmin
            ? [{ title: 'Dashboard', href: '/dashboard', icon: LayoutGrid }]
            : []),
        // Kehadiran Saya — all roles
        { title: 'Kehadiran Saya', href: '/my-attendance', icon: User },
        // Koreksi — admin/manager only
        ...(isManagerOrAdmin
            ? [{ title: 'Koreksi', href: '/corrections', icon: Shield }]
            : []),
        // Admin Management
        ...(role === 'admin'
            ? [
                  { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
                  { title: 'Jadwal Kerja', href: '/admin/work-schedules', icon: Clock },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
