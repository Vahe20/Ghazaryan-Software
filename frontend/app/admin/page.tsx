"use client"

import { useEffect, useState } from 'react';
import style from './page.module.scss';
import { AdminService, DashboardStats, Activity } from '@/src/services/admin.service';

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

    const getTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
            <div className={style.header}>
                <div>
                    <h2 className={style.title}>Dashboard</h2>
                </div>
                <button onClick={loadDashboardData} className={style.refreshBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className={style.statsGrid}>
                {statsCards.map((stat, index) => (
                    <div key={index} className={style.statCard}>
                        <div className={style.statHeader}>
                            <div className={style.statIcon}>
                                {stat.icon}
                            </div>
                            <span className={`${style.statChange} ${style[stat.trend]}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className={style.statBody}>
                            <p className={style.statTitle}>{stat.title}</p>
                            <p className={style.statValue}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={style.contentGrid}>
                <div className={style.card}>
                    <div className={style.cardHeader}>
                        <h2 className={style.cardTitle}>Recent Activity</h2>
                        <button className={style.viewAllBtn} onClick={() => window.location.href = '/admin/activity'}>
                            View All
                        </button>
                    </div>
                    <div className={style.activityList}>
                        {activities.length === 0 ? (
                            <p className={style.noData}>No recent activity</p>
                        ) : (
                            activities.slice(0, 5).map((activity, index) => (
                                <div key={index} className={style.activityItem}>
                                    <div className={style.activityIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div className={style.activityContent}>
                                        <p className={style.activityText}>{activity.description}</p>
                                        <p className={style.activityTime}>{getTimeAgo(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={style.card}>
                    <div className={style.cardHeader}>
                        <h2 className={style.cardTitle}>Top Applications</h2>
                    </div>
                    <div className={style.topAppsList}>
                        {stats.topApps.length === 0 ? (
                            <p className={style.noData}>No apps yet</p>
                        ) : (
                            stats.topApps.map((app) => (
                                <div key={app.id} className={style.topAppItem}>
                                    <img
                                        src={app.iconUrl}
                                        alt={app.name}
                                        className={style.appIcon}
                                    />
                                    <div className={style.appInfo}>
                                        <p className={style.appName}>{app.name}</p>
                                        <p className={style.appStats}>
                                            {app.downloadCount.toLocaleString()} downloads
                                        </p>
                                    </div>
                                    <div className={style.appRating}>
                                        <span>⭐ {app.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className={style.contentGrid}>
                <div className={style.card}>
                    <div className={style.cardHeader}>
                        <h2 className={style.cardTitle}>Quick Actions</h2>
                    </div>
                    <div className={style.quickActions}>
                        <button className={style.actionBtn} onClick={() => window.location.href = '/admin/users'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span>Manage Users</span>
                        </button>
                        <button className={style.actionBtn} onClick={() => window.location.href = '/admin/apps'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span>Manage Apps</span>
                        </button>
                        <button className={style.actionBtn} onClick={() => window.location.href = '/admin/orders'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span>View Orders</span>
                        </button>
                        <button className={style.actionBtn} onClick={loadDashboardData}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span>Refresh Data</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
