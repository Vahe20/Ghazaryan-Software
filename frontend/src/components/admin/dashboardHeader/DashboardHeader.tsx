import style from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
    onRefresh: () => void;
}

export default function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
    return (
        <div className={style.header}>
            <div>
                <h2 className={style.title}>Dashboard</h2>
            </div>
            <button onClick={onRefresh} className={style.refreshBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path 
                        d="M23 4v6h-6M1 20v-6h6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    <path 
                        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                </svg>
                Refresh
            </button>
        </div>
    );
}
