"use client"

import { useLibraryStore } from "@/src/store/LibraryStore";
import { useApp } from "@/src/hooks/queries/useApps";
import Link from "next/link";
import style from "./AppInfo.module.scss";

export const AppInfo = () => {
    const { selectedAppId } = useLibraryStore();
    const { data: app, isLoading } = useApp(selectedAppId || "");

    if (!selectedAppId) {
        return (
            <div className={style.placeholder}>
                <svg className={style.placeholder__icon} viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className={style.placeholder__title}>Select an app</h3>
                <p className={style.placeholder__text}>Choose an app from your library to view details</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={style.loading}>
                <div className={style.spinner}></div>
                <p>Loading app details...</p>
            </div>
        );
    }

    if (!app) {
        return (
            <div className={style.error}>
                <p>App not found</p>
            </div>
        );
    }

    return (
        <div className={style.appInfo}>
            <div className={style.appInfo__header}>
                <img
                    src={app.iconUrl}
                    alt={app.name}
                    className={style.appInfo__icon}
                />
                <div className={style.appInfo__headerContent}>
                    <h2 className={style.appInfo__name}>{app.name}</h2>
                    <p className={style.appInfo__version}>Version {app.version}</p>
                    <div className={style.appInfo__meta}>
                        <span className={style.appInfo__metaItem}>
                            {app.size ? `${(app.size / 1024 / 1024).toFixed(2)} MB` : "Size unknown"}
                        </span>
                        <span className={style.appInfo__metaDivider}>•</span>
                        <span className={style.appInfo__metaItem}>{app.platform || "Cross-platform"}</span>
                    </div>
                </div>
            </div>

            {app.coverUrl && (
                <div className={style.appInfo__cover}>
                    <img src={app.coverUrl} alt={app.name} />
                </div>
            )}

            <div className={style.appInfo__section}>
                <h3 className={style.appInfo__sectionTitle}>Description</h3>
                <p className={style.appInfo__description}>{app.description || app.shortDesc}</p>
            </div>

            {app.screenshots && app.screenshots.length > 0 && (
                <div className={style.appInfo__section}>
                    <h3 className={style.appInfo__sectionTitle}>Screenshots</h3>
                    <div className={style.screenshots}>
                        {app.screenshots.map((screenshot, index) => (
                            <img
                                key={index}
                                src={screenshot}
                                alt={`${app.name} screenshot ${index + 1}`}
                                className={style.screenshots__image}
                            />
                        ))}
                    </div>
                </div>
            )}

            {app.changelog && (
                <div className={style.appInfo__section}>
                    <h3 className={style.appInfo__sectionTitle}>Whats New</h3>
                    <div className={style.changelog}>
                        <p>{app.changelog}</p>
                    </div>
                </div>
            )}

            <div className={style.appInfo__actions}>
                {app.downloadUrl && (
                    <a
                        href={app.downloadUrl}
                        className={style.appInfo__button}
                        download
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625M21 16V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V16"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Download
                    </a>
                )}
                {app.sourceUrl && (
                    <a
                        href={app.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={style.appInfo__buttonSecondary}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Source Code
                    </a>
                )}
                {app.documentationUrl && (
                    <a
                        href={app.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={style.appInfo__buttonSecondary}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Documentation
                    </a>
                )}
                <Link
                    href={`/apps/${app.slug}`}
                    className={style.appInfo__buttonSecondary}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View in Store
                </Link>
            </div>
        </div>
    );
};
