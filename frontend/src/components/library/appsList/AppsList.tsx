"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { setSelectedApp } from "@/src/features/slices/librarySlice";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useGetUserLibraryQuery } from "@/src/features/api/appsApi";
import style from "./AppsList.module.scss";

type FilterType = "date" | "name" | "size";

const SORT_TABS: { label: string; value: FilterType }[] = [
    { label: "Recent", value: "date" },
    { label: "A–Z", value: "name" },
    { label: "Size", value: "size" },
];

export const AppsList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<FilterType>("date");
    const { data, isLoading } = useGetUserLibraryQuery();
    const dispatch = useAppDispatch();
    const selectedAppId = useAppSelector(s => s.library.selectedAppId);
    const debouncedSearchQuery = useDebounce(searchQuery);

    const apps = useMemo(() => {
        if (!data?.apps) return [];
        const filtered = data.apps.filter(app =>
            app.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        switch (sortBy) {
            case "name": return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
            case "date": return filtered.slice().sort((a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            case "size": return filtered.slice().sort((a, b) => (b.size || 0) - (a.size || 0));
            default: return filtered;
        }
    }, [data, debouncedSearchQuery, sortBy]);

    return (
        <div className={style.rail}>
            <div className={style.head}>
                <div className={style.head__top}>
                    <div className={style.head__title}>
                        <svg viewBox="0 0 24 24" fill="none" className={style.head__icon}>
                            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                        </svg>
                        <span>Library</span>
                    </div>
                    {!isLoading && (
                        <span className={style.head__count}>{apps.length}</span>
                    )}
                </div>

                <div className={style.search}>
                    <svg viewBox="0 0 24 24" fill="none" className={style.search__ico}>
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={style.search__input}
                    />
                    {searchQuery && (
                        <button className={style.search__clear} onClick={() => setSearchQuery("")} aria-label="Clear">
                            <svg viewBox="0 0 14 14" fill="none">
                                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                        </button>
                    )}
                </div>

                <div className={style.tabs}>
                    {SORT_TABS.map(tab => (
                        <button
                            key={tab.value}
                            className={`${style.tab} ${sortBy === tab.value ? style.tab_active : ""}`}
                            onClick={() => setSortBy(tab.value)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={style.list}>
                {isLoading ? (
                    <div className={style.skeletons}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={style.skeleton} style={{ opacity: 1 - i * 0.12 }} />
                        ))}
                    </div>
                ) : apps.length === 0 ? (
                    <div className={style.empty}>
                        <svg viewBox="0 0 48 48" fill="none" className={style.empty__svg}>
                            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
                            <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <p className={style.empty__label}>
                            {searchQuery ? "No results found" : "Your library is empty"}
                        </p>
                        <p className={style.empty__hint}>
                            {searchQuery ? "Try a different search term" : "Download apps from the catalog to get started"}
                        </p>
                    </div>
                ) : (
                    apps.map((app, i) => {
                        const isActive = selectedAppId === app.id;
                        const latestVersion = app.versions?.[0]?.version;
                        return (
                            <button
                                key={app.id}
                                className={`${style.card} ${isActive ? style.card_active : ""}`}
                                onClick={() => {
                                    if (app.id) {
                                        dispatch(setSelectedApp(app.id));
                                    }
                                }}
                                style={{ animationDelay: `${i * 25}ms` }}
                            >
                                <div className={style.card__thumb}>
                                    <img src={app.iconUrl} alt={app.name} className={style.card__img} />
                                </div>
                                <div className={style.card__body}>
                                    <span className={style.card__name}>{app.name}</span>
                                    <div className={style.card__row}>
                                        <span className={style.card__ver}>{latestVersion ? `v${latestVersion}` : "No version"}</span>
                                        {app.size && (
                                            <span className={style.card__size}>
                                                {(app.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        )}
                                        {app.deletedAt && (
                                            <span className={style.card__removed}>Removed</span>
                                        )}
                                    </div>
                                </div>
                                {isActive && <div className={style.card__dot} aria-hidden />}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
