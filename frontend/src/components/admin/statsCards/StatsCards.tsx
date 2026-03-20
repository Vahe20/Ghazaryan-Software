import { memo } from "react";
import style from "./StatsCards.module.scss";

interface StatCard {
    title: string;
    value: string;
    icon: React.ReactNode;
}

interface StatsCardsProps {
    stats: StatCard[];
}

const StatsCards = memo(function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className={style.statsGrid}>
            {stats.map((stat, index) => (
                <StatCardItem key={index} stat={stat} />
            ))}
        </div>
    );
});

const StatCardItem = memo(function StatCardItem({ stat }: { stat: StatCard }) {
    return (
        <div className={style.statCard}>
            <div className={style.statHeader}>
                <div className={style.statIcon}>{stat.icon}</div>
            </div>
            <div className={style.statBody}>
                <p className={style.statTitle}>{stat.title}</p>
                <p className={style.statValue}>{stat.value}</p>
            </div>
        </div>
    );
});

export default StatsCards;
