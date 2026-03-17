"use client";

import Link from "next/link";
import { memo } from "react";
import { useGetAppsQuery } from "@/src/features/api/appsApi";
import { AppCard } from "../../shared/appCard/AppCard";
import style from "./TopRatedAppsSection.module.scss";

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, i) => i);

export const TopRatedAppsSection = memo(function TopRatedAppsSection() {
    const { data, isLoading } = useGetAppsQuery({ limit: 6, sortBy: "rating" });
    const apps = data?.apps ?? [];

    return (
        <section className={style.section}>
            <div className={style.header}>
                <div>
                    <h2 className={style.title}>
                        Top Rated
                        <span className={style.titleBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Editor&apos;s Pick
                        </span>
                    </h2>
                    <p className={style.subtitle}>Highest rated by our community</p>
                </div>
                <Link href="/apps?sortBy=rating&order=desc" className={style.viewAll}>
                    See all
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {isLoading ? (
                <div className={style.grid}>
                    {SKELETON_ITEMS.map(i => <div key={i} className={style.skeleton} />)}
                </div>
            ) : apps.length === 0 ? (
                <div className={style.empty}>No apps yet.</div>
            ) : (
                <div className={style.grid}>
                    {apps.map(app => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            )}
        </section>
    );
});
