import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Clock, Folder, LayoutGrid, Monitor, Shield, TrendingUp, User, Users, Zap } from 'lucide-react';
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

    const mainNavItems: NavItem[] = [
        // 1. QR Station (Generator - Top Priority for Admin)
        ...(role === 'admin' || role === 'manager'
            ? [
                  {
                      title: 'Station Absensi',
                      href: '/qr/display',
                      icon: Monitor,
                  },
              ]
            : []),
        // 2. Attendance Hub (Scanner)
        {
            title: 'Absensi',
            href: '/attendance-hub',
            icon: Zap,
        },
        // 3. Analytics & Overview
        {
            title: 'Dashboard',
            href: '/team-analytics',
            icon: LayoutGrid,
        },
        {
            title: 'Team Performance',
            href: '/team-performance',
            icon: TrendingUp,
        },
        // 4. Compliance & Personal
        {
            title: 'Riwayat',
            href: '/log-management',
            icon: Shield,
        },
        {
            title: 'Performance',
            href: '/performance',
            icon: User,
        },
        // 5. Admin Management
        ...(role === 'admin'
            ? [
                  {
                      title: 'User Management',
                      href: '/admin/users',
                      icon: Users,
                  },
                  {
                      title: 'Work Schedules',
                      href: '/admin/work-schedules',
                      icon: Clock,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

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
