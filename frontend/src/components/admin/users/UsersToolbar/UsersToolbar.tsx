import base from "../../shared/_base.module.scss";

const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;

interface UsersToolbarProps {
    search: string;
    roleFilter: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
}

export default function UsersToolbar({ search, roleFilter, onSearchChange, onRoleChange }: UsersToolbarProps) {
    return (
        <div className={base.toolbar}>
            <div className={base.searchBox}>
                <svg className={base.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    className={base.searchInput}
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>
            <select className={base.filterSelect} value={roleFilter} onChange={e => onRoleChange(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
        </div>
    );
}
