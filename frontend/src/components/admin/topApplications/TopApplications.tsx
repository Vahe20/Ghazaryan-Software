import { memo } from "react";
import { DashboardStats } from "@/src/services/admin.service";
import style from "./TopApplications.module.scss";

type TopApp = DashboardStats["topApps"][number];

interface TopApplicationsProps {
    apps: TopApp[];
}

const TopApplications = memo(function TopApplications({ apps }: TopApplicationsProps) {
    return (
        <div className={style.card}>
            <div className={style.cardHeader}>
                <h2 className={style.cardTitle}>Top Applications</h2>
            </div>
            <div className={style.topAppsList}>
                {apps.length === 0 ? (
                    <p className={style.noData}>No apps yet</p>
                ) : (
                    apps.map(app => <TopAppItem key={app.id} app={app} />)
                )}
            </div>
        </div>
    );
});

const TopAppItem = memo(function TopAppItem({ app }: { app: TopApp }) {
    return (
        <div className={style.topAppItem}>
            <img src={app.iconUrl} alt={app.name} className={style.appIcon} />
            <div className={style.appInfo}>
                <p className={style.appName}>{app.name}</p>
                <p className={style.appStats}>{app.downloadCount.toLocaleString()} downloads</p>
            </div>
            <div className={style.appRating}>
                <span>⭐ {app.rating.toFixed(1)}</span>
            </div>
        </div>
    );
});

export default TopApplications;
