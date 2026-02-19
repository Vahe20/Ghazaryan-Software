"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useApps } from "@/src/hooks/queries/useApps";
import { AppCard } from "@/src/components/appCard/AppCard";
import style from "./PopularAppsSection.module.scss";

// Скелетоны — статичный массив, не нужно создавать каждый рендер
const SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => i);

export const PopularAppsSection = memo(function PopularAppsSection() {
    const { data, isLoading } = useApps({ limit: 12, sortBy: "downloadCount" });
    const popularApps = data?.apps ?? [];

    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft,  setCanScrollLeft]  = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        updateArrows();
        el.addEventListener("scroll", updateArrows, { passive: true });
        const ro = new ResizeObserver(updateArrows);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            ro.disconnect();
        };
    }, [popularApps, updateArrows]);

    const scrollLeft = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const cardWidth = el.querySelector("a")?.offsetWidth ?? 300;
        el.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
    }, []);

    const scrollRight = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const cardWidth = el.querySelector("a")?.offsetWidth ?? 300;
        el.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
    }, []);

    return (
        <section className={style.section}>
            <div className={style.header}>
                <h2 className={style.title}>Popular Apps</h2>
                <div className={style.controls}>
                    <button
                        className={`${style.arrow} ${!canScrollLeft ? style.arrowDisabled : ""}`}
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        aria-label="Scroll left"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        className={`${style.arrow} ${!canScrollRight ? style.arrowDisabled : ""}`}
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <Link href="/apps" className={style.viewAll}>View All →</Link>
                </div>
            </div>

            {isLoading ? (
                <div className={style.skeletonTrack}>
                    {SKELETON_ITEMS.map(i => <div key={i} className={style.skeleton} />)}
                </div>
            ) : popularApps.length === 0 ? (
                <div className={style.empty}>No apps available yet.</div>
            ) : (
                <div className={style.sliderWrapper}>
                    <div className={`${style.fadeLeft} ${canScrollLeft ? style.fadeVisible : ""}`} />
                    <div className={style.track} ref={trackRef}>
                        {popularApps.map(app => (
                            <div key={app.id} className={style.cardWrap}>
                                <AppCard app={app} />
                            </div>
                        ))}
                    </div>
                    <div className={`${style.fadeRight} ${canScrollRight ? style.fadeVisible : ""}`} />
                </div>
            )}
        </section>
    );
});
