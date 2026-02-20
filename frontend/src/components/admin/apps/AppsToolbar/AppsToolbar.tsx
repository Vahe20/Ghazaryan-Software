import base from "../../shared/_base.module.scss";

interface Category { id: string; name: string; slug: string; }

interface AppsToolbarProps {
    search: string;
    statusFilter: string;
    categoryFilter: string;
    categories: Category[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
}

export default function AppsToolbar({
    search, statusFilter, categoryFilter, categories,
    onSearchChange, onStatusChange, onCategoryChange,
}: AppsToolbarProps) {
    return (
        <div className={base.toolbar}>
            <div className={base.searchBox}>
                <svg className={base.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    className={base.searchInput}
                    placeholder="Search apps..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>
            <select className={base.filterSelect} value={statusFilter} onChange={e => onStatusChange(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="RELEASE">Release</option>
                <option value="BETA">Beta</option>
            </select>
            <select className={base.filterSelect} value={categoryFilter} onChange={e => onCategoryChange(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
    );
}
