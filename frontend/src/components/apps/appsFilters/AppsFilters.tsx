"use client"

import { useState } from "react";
import style from "./AppsFilters.module.scss";
import { useCategories } from "@/src/hooks/queries/useCategoryes";

interface AppsFiltersProps {
  searchQuery: string;
  sortBy: "name" | "downloadCount" | "createdAt";
  onSearchChange: (query: string) => void;
  onSortChange: (sort: "name" | "downloadCount" | "createdAt") => void;
}

export function AppsFilters({ searchQuery, sortBy, onSearchChange, onSortChange }: AppsFiltersProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data, isLoading, error } = useCategories();

  const categories = data as { id: string, name: string }[];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  if (isLoading) {
    return (
      <div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Failed to Load Category</h3>
        <button onClick={() => window.location.reload()} className={style.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={style.filtersPanel}>
      <div className={style.searchBox}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.searchIcon}>
          <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Categories</h3>
        <div className={style.checkboxGroup}>
          {categories.map(category => (
            <label key={category.id} className={style.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className={style.checkbox}
              />
              <span className={style.checkmark}></span>
              <span className={style.labelText}>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Sort By</h3>
        <div className={style.sortGroup}>
          <div className={style.radioGroup}>
            <label className={style.radioLabel}>
              <input
                type="radio"
                name="sortBy"
                value="downloadCount"
                checked={sortBy === "downloadCount"}
                onChange={(e) => onSortChange(e.target.value as any)}
                className={style.radio}
              />
              <span className={style.radioMark}></span>
              <span className={style.labelText}>Most Popular</span>
            </label>
            <label className={style.radioLabel}>
              <input
                type="radio"
                name="sortBy"
                value="createdAt"
                checked={sortBy === "createdAt"}
                onChange={(e) => onSortChange(e.target.value as any)}
                className={style.radio}
              />
              <span className={style.radioMark}></span>
              <span className={style.labelText}>Newest</span>
            </label>
            <label className={style.radioLabel}>
              <input
                type="radio"
                name="sortBy"
                value="name"
                checked={sortBy === "name"}
                onChange={(e) => onSortChange(e.target.value as any)}
                className={style.radio}
              />
              <span className={style.radioMark}></span>
              <span className={style.labelText}>Name</span>
            </label>
          </div>

          <button
            onClick={toggleSortOrder}
            className={style.sortOrderButton}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 17V3M10 3L4 9M10 3L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M10 17L16 11M10 17L4 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
