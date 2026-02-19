"use client";

import { memo, useCallback, useMemo } from "react";
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
    const { data, isLoading } = useCategories();
    const categories = useMemo(
        () => (data as { id: string; name: string }[]) ?? [],
        [data]
    );

    // Патч-обновление фильтров — стабильная функция
    const set = useCallback(
        (patch: Partial<AppsFiltersState>) => onChange({ ...filters, ...patch }),
        [filters, onChange]
    );

    const hasActiveFilters = useMemo(
        () =>
            filters.categoryId !== "" ||
            filters.platform   !== "" ||
            filters.status     !== "" ||
            filters.sortBy     !== "downloadCount" ||
            filters.order      !== "desc",
        [filters.categoryId, filters.platform, filters.status, filters.sortBy, filters.order]
    );

    const resetFilters = useCallback(
        () =>
            onChange({
                searchQuery: filters.searchQuery,
                sortBy:      "downloadCount",
                order:       "desc",
                categoryId:  "",
                platform:    "",
                status:      "",
            }),
        [filters.searchQuery, onChange]
    );

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => set({ searchQuery: e.target.value }),
        [set]
    );

    const handleClearSearch = useCallback(() => set({ searchQuery: "" }), [set]);

    const handleToggleOrder = useCallback(
        () => set({ order: filters.order === "asc" ? "desc" : "asc" }),
        [set, filters.order]
    );

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
                    onChange={handleSearchChange}
                    className={style.searchInput}
                />
                {filters.searchQuery && (
                    <button onClick={handleClearSearch} className={style.clearButton} type="button">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Reset */}
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
                            <CategoryCheckbox
                                key={cat.id}
                                id={cat.id}
                                name={cat.name}
                                checked={filters.categoryId === cat.id}
                                onToggle={set}
                                currentCategoryId={filters.categoryId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Platform */}
            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Platform</h3>
                <div className={style.checkboxGroup}>
                    {PLATFORMS.map(p => (
                        <PlatformCheckbox
                            key={p.value}
                            value={p.value}
                            label={p.label}
                            checked={filters.platform === p.value}
                            onToggle={set}
                            currentPlatform={filters.platform}
                        />
                    ))}
                </div>
            </div>

            {/* Status */}
            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Status</h3>
                <div className={style.checkboxGroup}>
                    {STATUSES.map(s => (
                        <StatusCheckbox
                            key={s.value}
                            value={s.value}
                            label={s.label}
                            checked={filters.status === s.value}
                            onToggle={set}
                            currentStatus={filters.status}
                        />
                    ))}
                </div>
            </div>

            {/* Sort */}
            <div className={style.filterSection}>
                <h3 className={style.filterTitle}>Sort By</h3>
                <div className={style.sortGroup}>
                    <div className={style.radioGroup}>
                        {SORT_OPTIONS.map(opt => (
                            <SortRadio
                                key={opt.value}
                                value={opt.value}
                                label={opt.label}
                                checked={filters.sortBy === opt.value}
                                onToggle={set}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleToggleOrder}
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

// ── Отдельные мемоизированные чекбоксы ────────────────────────────────────────
// Выносим в отдельные компоненты чтобы при изменении одного чекбокса
// не перерендеривались все остальные

const CategoryCheckbox = memo(function CategoryCheckbox({
    id, name, checked, onToggle, currentCategoryId,
}: {
    id: string;
    name: string;
    checked: boolean;
    onToggle: (patch: Partial<AppsFiltersState>) => void;
    currentCategoryId: string;
}) {
    const handleChange = useCallback(
        () => onToggle({ categoryId: currentCategoryId === id ? "" : id }),
        [onToggle, currentCategoryId, id]
    );
    return (
        <label className={style.checkboxLabel}>
            <input type="checkbox" checked={checked} onChange={handleChange} className={style.checkbox} />
            <span className={style.checkmark} />
            <span className={style.labelText}>{name}</span>
        </label>
    );
});

const PlatformCheckbox = memo(function PlatformCheckbox({
    value, label, checked, onToggle, currentPlatform,
}: {
    value: string;
    label: string;
    checked: boolean;
    onToggle: (patch: Partial<AppsFiltersState>) => void;
    currentPlatform: string;
}) {
    const handleChange = useCallback(
        () => onToggle({ platform: currentPlatform === value ? "" : value }),
        [onToggle, currentPlatform, value]
    );
    return (
        <label className={style.checkboxLabel}>
            <input type="checkbox" checked={checked} onChange={handleChange} className={style.checkbox} />
            <span className={style.checkmark} />
            <span className={style.labelText}>{label}</span>
        </label>
    );
});

const StatusCheckbox = memo(function StatusCheckbox({
    value, label, checked, onToggle, currentStatus,
}: {
    value: string;
    label: string;
    checked: boolean;
    onToggle: (patch: Partial<AppsFiltersState>) => void;
    currentStatus: string;
}) {
    const handleChange = useCallback(
        () => onToggle({ status: currentStatus === value ? "" : value }),
        [onToggle, currentStatus, value]
    );
    return (
        <label className={style.checkboxLabel}>
            <input type="checkbox" checked={checked} onChange={handleChange} className={style.checkbox} />
            <span className={style.checkmark} />
            <span className={style.labelText}>{label}</span>
        </label>
    );
});

const SortRadio = memo(function SortRadio({
    value, label, checked, onToggle,
}: {
    value: SortType;
    label: string;
    checked: boolean;
    onToggle: (patch: Partial<AppsFiltersState>) => void;
}) {
    const handleChange = useCallback(
        () => onToggle({ sortBy: value }),
        [onToggle, value]
    );
    return (
        <label className={style.radioLabel}>
            <input type="radio" name="sortBy" value={value} checked={checked} onChange={handleChange} className={style.radio} />
            <span className={style.radioMark} />
            <span className={style.labelText}>{label}</span>
        </label>
    );
});
