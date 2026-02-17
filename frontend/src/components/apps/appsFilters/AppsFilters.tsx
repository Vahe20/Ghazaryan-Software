"use client"

import style from "./AppsFilters.module.scss";
import { useCategories } from "@/src/hooks/queries/useCategoryes";

type SortType = "name" | "downloadCount" | "createdAt" | "rating";
type PlatformType = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
type StatusType = "BETA" | "RELEASE";

export interface AppsFiltersState {
  searchQuery: string;
  sortBy: SortType;
  order: "asc" | "desc";
  categoryId: string;
  platform: string;
  status: string;
}

interface AppsFiltersProps {
  filters: AppsFiltersState;
  onChange: (filters: AppsFiltersState) => void;
}

const PLATFORMS: { value: PlatformType; label: string }[] = [
  { value: "WINDOWS", label: "Windows" },
  { value: "MAC", label: "macOS" },
  { value: "LINUX", label: "Linux" },
  { value: "ANDROID", label: "Android" },
  { value: "IOS", label: "iOS" },
];

export function AppsFilters({ filters, onChange }: AppsFiltersProps) {
  const { data, isLoading } = useCategories();
  const categories = (data as { id: string; name: string }[]) ?? [];

  const set = (patch: Partial<AppsFiltersState>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.categoryId !== "" ||
    filters.platform !== "" ||
    filters.status !== "" ||
    filters.sortBy !== "downloadCount" ||
    filters.order !== "desc";

  const resetFilters = () =>
    onChange({
      searchQuery: filters.searchQuery,
      sortBy: "downloadCount",
      order: "desc",
      categoryId: "",
      platform: "",
      status: "",
    });

  return (
    <div className={style.filtersPanel}>
      {/* Search */}
      <div className={style.searchBox}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.searchIcon}>
          <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          placeholder="Search applications..."
          value={filters.searchQuery}
          onChange={e => set({ searchQuery: e.target.value })}
          className={style.searchInput}
        />
        {filters.searchQuery && (
          <button onClick={() => set({ searchQuery: "" })} className={style.clearButton} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <button className={style.resetBtn} onClick={resetFilters}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset filters
        </button>
      )}

      {/* Categories */}
      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Categories</h3>
        {isLoading ? (
          <p className={style.loadingText}>Loading...</p>
        ) : (
          <div className={style.checkboxGroup}>
            {categories.map(cat => (
              <label key={cat.id} className={style.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.categoryId === cat.id}
                  onChange={() =>
                    set({ categoryId: filters.categoryId === cat.id ? "" : cat.id })
                  }
                  className={style.checkbox}
                />
                <span className={style.checkmark} />
                <span className={style.labelText}>{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Platform */}
      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Platform</h3>
        <div className={style.checkboxGroup}>
          {PLATFORMS.map(p => (
            <label key={p.value} className={style.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.platform === p.value}
                onChange={() =>
                  set({ platform: filters.platform === p.value ? "" : p.value })
                }
                className={style.checkbox}
              />
              <span className={style.checkmark} />
              <span className={style.labelText}>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Status</h3>
        <div className={style.checkboxGroup}>
          {(["RELEASE", "BETA"] as StatusType[]).map(s => (
            <label key={s} className={style.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.status === s}
                onChange={() => set({ status: filters.status === s ? "" : s })}
                className={style.checkbox}
              />
              <span className={style.checkmark} />
              <span className={style.labelText}>{s === "RELEASE" ? "Released" : "Beta"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className={style.filterSection}>
        <h3 className={style.filterTitle}>Sort By</h3>
        <div className={style.sortGroup}>
          <div className={style.radioGroup}>
            {([
              { value: "downloadCount", label: "Most Popular" },
              { value: "createdAt", label: "Newest" },
              { value: "rating", label: "Top Rated" },
              { value: "name", label: "Name" },
            ] as { value: SortType; label: string }[]).map(opt => (
              <label key={opt.value} className={style.radioLabel}>
                <input
                  type="radio"
                  name="sortBy"
                  value={opt.value}
                  checked={filters.sortBy === opt.value}
                  onChange={() => set({ sortBy: opt.value })}
                  className={style.radio}
                />
                <span className={style.radioMark} />
                <span className={style.labelText}>{opt.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={() => set({ order: filters.order === "asc" ? "desc" : "asc" })}
            className={style.sortOrderButton}
            title={filters.order === "asc" ? "Ascending" : "Descending"}
          >
            {filters.order === "asc" ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 17V3M10 3L4 9M10 3L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M10 17L16 11M10 17L4 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>{filters.order === "asc" ? "Ascending" : "Descending"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
