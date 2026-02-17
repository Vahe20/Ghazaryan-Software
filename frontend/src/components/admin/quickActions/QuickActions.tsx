import style from './QuickActions.module.scss';

interface QuickActionsProps {
    onRefresh: () => void;
}

export default function QuickActions({ onRefresh }: QuickActionsProps) {
    return (
        <div className={style.card}>
            <div className={style.cardHeader}>
                <h2 className={style.cardTitle}>Quick Actions</h2>
            </div>
            <div className={style.quickActions}>
                <button 
                    className={style.actionBtn} 
                    onClick={() => window.location.href = '/admin/users'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path 
                            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>Manage Users</span>
                </button>
                
                <button 
                    className={style.actionBtn} 
                    onClick={() => window.location.href = '/admin/apps'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect 
                            x="3" 
                            y="3" 
                            width="18" 
                            height="18" 
                            rx="2" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                    </svg>
                    <span>Manage Apps</span>
                </button>
                
                <button 
                    className={style.actionBtn} 
                    onClick={() => window.location.href = '/admin/orders'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path 
                            d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                    </svg>
                    <span>View Orders</span>
                </button>
                
                <button className={style.actionBtn} onClick={onRefresh}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path 
                            d="M23 4v6h-6M1 20v-6h6" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                        <path 
                            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                    </svg>
                    <span>Refresh Data</span>
                </button>
            </div>
        </div>
    );
}
