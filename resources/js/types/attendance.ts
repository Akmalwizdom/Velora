/**
 * TypeScript interfaces for Velora attendance system.
 */

// Common types
export interface TeamMember {
    id: number;
    name: string;
    avatar: string;
    time?: string;
    status?: 'late' | 'active' | 'away' | 'absent';
}

export type QrMode = 'required' | 'optional' | 'hybrid';

export interface QrSessionData {
    token: string;
    expires_at: string;
    session_id: number;
    ttl: number;
    type: 'check_in' | 'check_out';
}

// Attendance Hub Props (Absensi page)
export interface AttendanceHubProps {
    sessionActive: boolean;
    todayStatus: {
        status: 'on_time' | 'late' | 'not_checked_in';
        checkedInAt: string | null;
        schedule: string;
        stationName: string;
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

// Team Analytics / Dashboard Props
export interface TeamAnalyticsProps {
    stats: {
        presence: number;
        activeNow: number;
        lateAbsent: number;
    };
    lateMembers: TeamMember[];
    activeMembers: TeamMember[];
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

// Performance Dashboard / Kehadiran Saya Props
export interface PerformanceDashboardProps {
    attendanceState: string;
    attendanceStatus: string;
    activeHours: number;
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

// My Attendance Props (Kehadiran Saya page)
export interface MyAttendanceProps {
    attendanceHistory: AttendanceRecord[];
    corrections: CorrectionRecord[];
    monthlyStats: {
        totalDays: number;
        presentDays: number;
        lateDays: number;
        absentDays: number;
        avgHoursPerDay: number;
    };
}

export interface AttendanceRecord {
    id: number;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    hoursWorked: number;
    status: 'on_time' | 'late' | 'absent' | 'correction';
    stationName: string | null;
}

export interface CorrectionRecord {
    id: number;
    type: 'check_out' | 'check_in' | 'both';
    originalTime: string | null;
    proposedTime: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt: string | null;
    reviewerName: string | null;
}

// Log Management / Koreksi Props
export interface LogManagementProps {
    corrections: CorrectionData[];
    totalPending: number;
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
        avatar?: string;
    };
    reviewer: {
        id: number;
        name: string;
    } | null;
    submittedAt: string;
    reviewedAt: string | null;
    auditLog: AuditLogItem[];
}

export interface AuditLogItem {
    time: string;
    event: string;
    status: 'mismatch' | 'pending' | 'success';
}
