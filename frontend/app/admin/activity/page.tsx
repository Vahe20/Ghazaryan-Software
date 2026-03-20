"use client";

import { useMemo } from "react";
import { useGetRecentActivityQuery } from "@/src/features/api/adminApi";
import s from "../admin.module.scss";
import style from "./page.module.scss";

function getTimeAgo(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function AdminActivityPage() {
    const { data, isLoading, isError } = useGetRecentActivityQuery();

    const activities = useMemo(
        () => [...(data ?? [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [data]
    );

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Activity</h1>
                    <p className={s.pageSubtitle}>All recent system activity in chronological order</p>
                </div>
            </div>

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading activity...</p></div>
                ) : isError ? (
                    <div className={s.errorState}><p>Failed to load activity</p></div>
                ) : activities.length === 0 ? (
                    <div className={s.empty}><p>No activity found</p></div>
                ) : (
                    <div className={style.activityList}>
                        {activities.map((activity, index) => (
                            <div className={style.activityItem} key={`${activity.timestamp}-${index}`}>
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
