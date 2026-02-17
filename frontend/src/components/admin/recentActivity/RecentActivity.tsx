import { Activity } from '@/src/services/admin.service';
import style from './RecentActivity.module.scss';

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
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

    return (
        <div className={style.card}>
            <div className={style.cardHeader}>
                <h2 className={style.cardTitle}>Recent Activity</h2>
                <button 
                    className={style.viewAllBtn} 
                    onClick={() => window.location.href = '/admin/activity'}
                >
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
                                    <circle 
                                        cx="12" 
                                        cy="12" 
                                        r="10" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                    />
                                    <path 
                                        d="M12 6v6l4 2" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                    />
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
    );
}
