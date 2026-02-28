"use client";

import { memo, useCallback, useMemo } from "react";
import FilterCheckbox from "@/src/components/shared/FilterCheckbox/FilterCheckbox";
import { useGetCategoriesQuery } from "@/src/features/api/categoriesApi";
import type { PlatformType, SortType, StatusType } from "@/src/types/Entities";
import style from "./AppsFilters.module.scss";

export interface AppsFiltersState {
    searchQuery: string;
    sortBy: SortType;
    order: "asc" | "desc";
    categoryId: string;
    platform: PlatformType | "";
    status: StatusType | "";
}

interface AppsFiltersProps {
    filters: AppsFiltersState;
    onChange: (filters: AppsFiltersState) => void;
}

const PLATFORMS: { value: PlatformType; label: string }[] = [
    { value: "WINDOWS", label: "Windows" },
    { value: "MAC",     label: "macOS"   },
    { value: "LINUX",   label: "Linux"   },
    { value: "ANDROID", label: "Android" },
    { value: "IOS",     label: "iOS"     },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
    { value: "downloadCount", label: "Most Popular" },
    { value: "createdAt",     label: "Newest"       },
    { value: "rating",        label: "Top Rated"    },
    { value: "name",          label: "Name"         },
];

const STATUSES: { value: StatusType; label: string }[] = [
    { value: "RELEASE", label: "Released" },
    { value: "BETA",    label: "Beta"     },
];

export const AppsFilters = memo(function AppsFilters({ filters, onChange }: AppsFiltersProps) {
    const { data, isLoading } = useGetCategoriesQuery();
    const categories = useMemo(() => (data as { id: string; name: string }[]) ?? [], [data]);

    const set = useCallback(
        (patch: Partial<AppsFiltersState>) => onChange({ ...filters, ...patch }),
        [filters, onChange]
    );

    const hasActiveFilters = useMemo(
        () => filters.categoryId !== "" || filters.platform !== "" || filters.status !== "" || filters.sortBy !== "downloadCount" || filters.order !== "desc",
        [filters.categoryId, filters.platform, filters.status, filters.sortBy, filters.order]
    );

    const resetFilters = useCallback(
        () => onChange({ searchQuery: filters.searchQuery, sortBy: "downloadCount", order: "desc", categoryId: "", platform: "", status: "" }),
        [filters.searchQuery, onChange]
    );

    return (
        <div className={style.filtersPanel}>
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

            {hasActiveFilters && (
                <button className={style.resetBtn} onClick={resetFilters}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Reset filters
                </button>
            )}

            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Categories</h3>
                {isLoading ? (
                    <p className={style.loadingText}>Loading...</p>
                ) : (
                    <div className={style.checkboxGroup}>
                        {categories.map(cat => (
                            <FilterCheckbox
                                key={cat.id}
                                label={cat.name}
                                checked={filters.categoryId === cat.id}
                                onChange={checked => set({ categoryId: checked ? cat.id : "" })}
                                className={style.checkboxLabel}
                                checkmarkClassName={style.checkmark}
                                labelTextClassName={style.labelText}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Platform</h3>
                <div className={style.checkboxGroup}>
                    {PLATFORMS.map(p => (
                        <FilterCheckbox
                            key={p.value}
                            label={p.label}
                            checked={filters.platform === p.value}
                            onChange={checked => set({ platform: checked ? p.value : "" })}
                            className={style.checkboxLabel}
                            checkmarkClassName={style.checkmark}
                            labelTextClassName={style.labelText}
                        />
                    ))}
                </div>
            </div>

            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Status</h3>
                <div className={style.checkboxGroup}>
                    {STATUSES.map(s => (
                        <FilterCheckbox
                            key={s.value}
                            label={s.label}
                            checked={filters.status === s.value}
                            onChange={checked => set({ status: checked ? s.value : "" })}
                            className={style.checkboxLabel}
                            checkmarkClassName={style.checkmark}
                            labelTextClassName={style.labelText}
                        />
                    ))}
                </div>
            </div>

            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Sort By</h3>
                <div className={style.sortGroup}>
                    <div className={style.radioGroup}>
                        {SORT_OPTIONS.map(opt => (
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
});
