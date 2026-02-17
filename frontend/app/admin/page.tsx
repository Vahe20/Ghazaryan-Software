"use client"

import { useEffect, useState } from 'react';
import { AdminService, DashboardStats, Activity } from '@/src/services/admin.service';
import DashboardHeader from '@/src/components/admin/dashboardHeader/DashboardHeader';
import StatsCards from '@/src/components/admin/statsCards/StatsCards';
import RecentActivity from '@/src/components/admin/recentActivity/RecentActivity';
import TopApplications from '@/src/components/admin/topApplications/TopApplications';
import QuickActions from '@/src/components/admin/quickActions/QuickActions';
import style from './page.module.scss';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, activityData] = await Promise.all([
                AdminService.getDashboardStats(),
                AdminService.getRecentActivity(),
            ]);

            setStats(statsData);
            setActivities(activityData);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className={style.dashboard}>
                <div className={style.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className={style.dashboard}>
                <div className={style.error}>{error || 'No data available'}</div>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.overview.totalUsers.toLocaleString(),
            change: formatChange(stats.changes.userChange),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            trend: stats.changes.userChange >= 0 ? 'up' : 'down'
        },
        {
            title: 'Total Applications',
            value: stats.overview.totalApps.toString(),
            change: formatChange(stats.changes.appChange),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            trend: stats.changes.appChange >= 0 ? 'up' : 'down'
        },
        {
            title: 'Total Purchases',
            value: stats.overview.totalPurchases.toLocaleString(),
            change: formatChange(stats.changes.purchaseChange),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            trend: stats.changes.purchaseChange >= 0 ? 'up' : 'down'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.overview.totalRevenue),
            change: formatChange(stats.changes.revenueChange),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            trend: stats.changes.revenueChange >= 0 ? 'up' : 'down'
        }
    ];

    return (
        <div className={style.dashboard}>
            <DashboardHeader onRefresh={loadDashboardData} />

            <StatsCards stats={statsCards} />

            <div className={style.contentGrid}>
                <RecentActivity activities={activities} />
                <TopApplications apps={stats.topApps} />
            </div>

            <div className={style.contentGrid}>
                <QuickActions onRefresh={loadDashboardData} />
            </div>
        </div>
    );
}
