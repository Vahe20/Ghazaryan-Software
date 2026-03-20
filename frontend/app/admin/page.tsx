"use client"

import DashboardHeader from '@/src/components/admin/dashboardHeader/DashboardHeader';
import StatsCards from '@/src/components/admin/statsCards/StatsCards';
import RecentActivity from '@/src/components/admin/recentActivity/RecentActivity';
import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from '@/src/features/api/adminApi';
import style from './page.module.scss';

export default function AdminDashboard() {
    const { data: stats, isLoading, error, refetch } = useGetDashboardStatsQuery();
    const { data: activities } = useGetRecentActivityQuery();

    const loadDashboardData = () => {
        refetch();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className={style.dashboard}>
                <div className={style.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className={style.dashboard}>
                <div className={style.error}>
                    {error ? 'Failed to load dashboard' : 'No data available'}
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.overview.totalUsers.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )
        },
        {
            title: 'Total Applications',
            value: stats.overview.totalApps.toString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
                </svg>
            )
        },
        {
            title: 'Total Purchases',
            value: stats.overview.totalPurchases.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" />
                </svg>
            )
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.overview.totalRevenue),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    return (
        <div className={style.dashboard}>
            <DashboardHeader onRefresh={loadDashboardData} />

            <StatsCards stats={statsCards} />

            <div className={style.contentGrid}>
            <RecentActivity activities={activities || []} />
            </div>

        </div>
    );
}
