import { User } from '@/src/types/user.types';
import style from './StatsGrid.module.scss';

function formatBalance(balance: number | undefined): string {
    const num = Number(balance || 0);
    if (num >= 1_000_000) {
        return '$' + (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 10_000) {
        return '$' + (num / 1_000).toFixed(1) + 'K';
    }
    return '$' + num.toFixed(2);
}

interface StatsGridProps {
    user: User;
    onTopUpClick: () => void;
}

export default function StatsGrid({ user, onTopUpClick }: StatsGridProps) {
    return (
        <div className={style.statsGrid}>
            <div className={style.statCard}>
                <div className={style.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className={style.statInfo}>
                    <p className={style.statLabel}>Balance</p>
                    <p
                        className={style.statValue}
                        title={'$' + Number(user.balance || 0).toFixed(2)}
                    >
                        {formatBalance(user.balance)}
                    </p>
                </div>
                <button
                    className={style.topUpBtn}
                    onClick={onTopUpClick}
                    title="Top up balance"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 5V19M5 12H19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            <div className={style.statCard}>
                <div className={style.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M3 9H21M9 21V9"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <div className={style.statInfo}>
                    <p className={style.statLabel}>Applications</p>
                    <p className={style.statValue}>{user.purchases?.length || 0}</p>
                </div>
            </div>

            <div className={style.statCard}>
                <div className={style.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <circle
                            cx="12"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <div className={style.statInfo}>
                    <p className={style.statLabel}>Member Since</p>
                    <p className={style.statValue}>2025</p>
                </div>
            </div>
        </div>
    );
}
