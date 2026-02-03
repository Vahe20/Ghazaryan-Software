"use client"

import style from "./AppsFilters.module.scss";

interface AppsFiltersProps {
  searchQuery: string;
  sortBy: "name" | "downloadCount" | "createdAt";
  onSearchChange: (query: string) => void;
  onSortChange: (sort: "name" | "downloadCount" | "createdAt") => void;
}

export function AppsFilters({ searchQuery, sortBy, onSearchChange, onSortChange }: AppsFiltersProps) {
  return (
    <div className={style.filters}>
      <div className={style.searchBox}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.searchIcon}>
          <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={style.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className={style.clearButton}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className={style.sortBox}>
        <label htmlFor="sort" className={style.sortLabel}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5H15M3 9H11M3 13.5H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Sort by:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className={style.sortSelect}
        >
          <option value="downloadCount">Most Popular</option>
          <option value="createdAt">Newest</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
