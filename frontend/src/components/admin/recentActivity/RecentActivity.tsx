import { memo, useMemo } from "react";
import { Activity } from "@/src/services/admin.service";
import style from "./RecentActivity.module.scss";

interface RecentActivityProps {
    activities: Activity[];
}

function getTimeAgo(timestamp: string): string {
    const diffMs    = Date.now() - new Date(timestamp).getTime();
    const diffMins  = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays  = Math.floor(diffMs / 86_400_000);

    if (diffMins  < 1)  return "Just now";
    if (diffMins  < 60) return `${diffMins} minute${diffMins  > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours  > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

const RecentActivity = memo(function RecentActivity({ activities }: RecentActivityProps) {
    // Берём только 5 последних — пересчитывается только при смене activities
    const visibleActivities = useMemo(() => activities.slice(0, 5), [activities]);

    return (
        <div className={style.card}>
            <div className={style.cardHeader}>
                <h2 className={style.cardTitle}>Recent Activity</h2>
                <button
                    className={style.viewAllBtn}
                    onClick={() => window.location.href = "/admin/activity"}
                >
                    View All
                </button>
            </div>
            <div className={style.activityList}>
                {visibleActivities.length === 0 ? (
                    <p className={style.noData}>No recent activity</p>
                ) : (
                    visibleActivities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                    ))
                )}
            </div>
        </div>
    );
});

// Каждый элемент мемоизирован отдельно
const ActivityItem = memo(function ActivityItem({ activity }: { activity: Activity }) {
    // timeAgo пересчитывается только при смене timestamp
    const timeAgo = useMemo(() => getTimeAgo(activity.timestamp), [activity.timestamp]);

    return (
        <div className={style.activityItem}>
            <div className={style.activityIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <div className={style.activityContent}>
                <p className={style.activityText}>{activity.description}</p>
                <p className={style.activityTime}>{timeAgo}</p>
            </div>
        </div>
    );
});

export default RecentActivity;
