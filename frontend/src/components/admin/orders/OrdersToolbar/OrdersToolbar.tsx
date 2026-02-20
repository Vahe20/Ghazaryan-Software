import base from "../../shared/_base.module.scss";

const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;

interface OrdersToolbarProps {
    search: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export default function OrdersToolbar({ search, statusFilter, onSearchChange, onStatusChange }: OrdersToolbarProps) {
    return (
        <div className={base.toolbar}>
            <div className={base.searchBox}>
                <svg className={base.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    className={base.searchInput}
                    placeholder="Search by user or app..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>
            <select className={base.filterSelect} value={statusFilter} onChange={e => onStatusChange(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
        </div>
    );
}
