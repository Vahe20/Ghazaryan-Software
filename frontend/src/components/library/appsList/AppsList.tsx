"use client"

import { useState, useMemo } from "react";
import { useUserLibrary } from "@/src/hooks/queries/useApps";
import { useLibraryStore } from "@/src/store/LibraryStore";
import style from "./AppsList.module.scss";

export const AppsList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
    const { data, isLoading } = useUserLibrary();
    const { selectedAppId, setSelectedApp } = useLibraryStore();

    const filteredAndSortedApps = useMemo(() => {
        if (!data?.apps) return [];

        let filtered = data.apps.filter(app =>
            app.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        switch (sortBy) {
            case "name":
                return filtered.sort((a, b) => a.name.localeCompare(b.name));
            case "date":
                return filtered.sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
            case "size":
                return filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
            default:
                return filtered;
        }
    }, [data?.apps, searchQuery, sortBy]);

    if (isLoading) {
        return (
            <div className={style.loading}>
                <div className={style.spinner}></div>
                <p>Loading your library...</p>
            </div>
        );
    }

    return (
        <div className={style.appsList}>
            <div className={style.appsList__header}>
                <h2 className={style.appsList__title}>My Library</h2>
                <div className={style.appsList__stats}>
                    {filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? "app" : "apps"}
                </div>
            </div>

            <div className={style.appsList__controls}>
                <div className={style.searchBox}>
                    <svg className={style.searchBox__icon} viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={style.searchBox__input}
                    />
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={style.sortSelect}
                >
                    <option value="name">Name</option>
                    <option value="date">Recently Added</option>
                    <option value="size">Size</option>
                </select>
            </div>

            {filteredAndSortedApps.length === 0 ? (
                <div className={style.empty}>
                    <svg className={style.empty__icon} viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
                            stroke="currentColor" strokeWidth="2" />
                        <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <h3 className={style.empty__title}>
                        {searchQuery ? "No apps found" : "Your library is empty"}
                    </h3>
                    <p className={style.empty__text}>
                        {searchQuery
                            ? "Try adjusting your search"
                            : "Download some apps to get started"}
                    </p>
                </div>
            ) : (
                <div className={style.appsList__grid}>
                    {filteredAndSortedApps.map((app) => (
                        <div
                            key={app.id}
                            className={`${style.appItem} ${selectedAppId === app.id ? style.appItem_active : ""}`}
                            onClick={() => setSelectedApp(app.id)}
                        >
                            <img
                                src={app.iconUrl}
                                alt={app.name}
                                className={style.appItem__icon}
                            />
                            <div className={style.appItem__content}>
                                <h3 className={style.appItem__name}>{app.name}</h3>
                                <p className={style.appItem__version}>v{app.version}</p>
                            </div>
                            <div className={style.appItem__size}>
                                {app.size ? `${(app.size / 1024 / 1024).toFixed(1)} MB` : "N/A"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
