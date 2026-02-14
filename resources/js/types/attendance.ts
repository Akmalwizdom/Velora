/**
 * TypeScript interfaces for Velora attendance system.
 */

// Common types
export interface TeamMember {
    id: number;
    name: string;
    avatar: string;
    time?: string;
    status?: 'late' | 'remote' | 'active' | 'away';
}

export type QrMode = 'required' | 'optional' | 'hybrid';

export interface QrSessionData {
    token: string;
    expires_at: string;
    session_id: number;
    ttl: number;
}

// Attendance Hub Props
export interface AttendanceHubProps {
    sessionActive: boolean;
    todayStatus: {
        status: 'on_time' | 'late' | 'not_checked_in';
        checkedInAt: string | null;
        schedule: string;
        stationName: string;
        workMode: 'office' | 'remote' | 'hybrid' | 'business_trip';
    };
    qrMode: QrMode;
    weeklyProgress: {
        hoursWorked: number;
        targetHours: number;
        percentage: number;
    };
    activeTeamMembers: {
        members: TeamMember[];
        remainingCount: number;
        totalActive: number;
    };
    performanceData: {
        trend: number;
        weeklyBars: number[];
    };
    attendanceMetrics: {
        presence: {
            current: number;
            target: number;
            percentage: number;
        };
        punctuality: {
            rate: number;
        };
        lateness: {
            count: number;
        };
    };
}

// Team Analytics Props
export interface TeamAnalyticsProps {
    stats: {
        presence: number;
        activeNow: number;
        remote: number;
        lateAbsent: number;
    };
    lateMembers: TeamMember[];
    remoteMembers: TeamMember[];
    pulseFeed: PulseFeedItem[];
    energyFlux: number[];
}

// Team Performance Props
export interface TeamPerformanceProps {
    employeeMetrics: EmployeeMetric[];
    teamSummary: {
        avgPunctuality: number;
        totalEmployees: number;
    };
}

export interface EmployeeMetric {
    id: number;
    name: string;
    avatar: string;
    presence: {
        current: number;
        target: number;
        percentage: number;
    };
    punctuality: {
        rate: number;
    };
    lateness: {
        count: number;
    };
    dailyLogs: DailyLogEntry[];
}

export interface DailyLogEntry {
    date: string;
    checkIn: string;
    checkOut: string | null;
    status: string;
}

export interface PulseFeedItem {
    type: 'warning' | 'peak' | 'success';
    title: string;
    desc: string;
    action?: string;
    members?: string[];
}

// Performance Dashboard Props
export interface PerformanceDashboardProps {
    attendanceState: string;
    attendanceStatus: string;
    activeHours: number;
    workMode: string;
    recentActivity: ActivityItem[];
    weeklyPattern: number[];
}

export interface ActivityItem {
    time: string;
    title: string;
    desc: string;
    status: 'success' | 'alert' | 'collab' | 'focus';
    icon: string;
}

// Log Management Props
export interface LogManagementProps {
    correction: CorrectionData | null;
    auditLog: AuditLogItem[];
    hasCorrection: boolean;
}

export interface CorrectionData {
    id: number;
    requestCode: string;
    originalTime: string;
    proposedTime: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requester: {
        id: number;
        name: string;
    };
    reviewer: {
        id: number;
        name: string;
    } | null;
    submittedAt: string;
    reviewedAt: string | null;
}

export interface AuditLogItem {
    time: string;
    event: string;
    status: 'mismatch' | 'pending' | 'success';
}
