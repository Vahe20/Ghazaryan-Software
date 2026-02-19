"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { useCategories } from "@/src/hooks/queries/useCategoryes";
import style from "./CategoriesSection.module.scss";

const GRADIENTS = [
    ["#0084ff", "#00c6ff"],
    ["#ff006e", "#ff6b9d"],
    ["#7c3aed", "#a78bfa"],
    ["#059669", "#34d399"],
    ["#d97706", "#fbbf24"],
    ["#dc2626", "#f87171"],
    ["#0891b2", "#67e8f9"],
    ["#9d174d", "#f472b6"],
];

// SVG иконки вынесены в константы — создаются один раз, не при каждом рендере
const ICONS = [
    <svg key="0" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M6 12h4M8 10v4M15 11h.01M17 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
    <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="currentColor" strokeWidth="2" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="currentColor" strokeWidth="2" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="currentColor" strokeWidth="2" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" stroke="currentColor" strokeWidth="2" /></svg>,
    <svg key="3" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    <svg key="4" width="28" height="28" viewBox="0 0 24 24" fill="none"><polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2" /></svg>,
    <svg key="5" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    <svg key="6" width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" /><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
    <svg key="7" width="28" height="28" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="currentColor" strokeWidth="2" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2" /></svg>,
];

// Статичные скелетоны
const SKELETON_ITEMS = Array.from({ length: 8 }, (_, i) => i);

interface Category { id: string; name: string; slug: string; }

export const CategoriesSection = memo(function CategoriesSection() {
    const { data, isLoading } = useCategories();
    const categories = useMemo(
        () => (data as Category[]) ?? [],
        [data]
    );

    // Вычисляем массив с градиентами один раз при изменении categories
    const categoriesWithMeta = useMemo(
        () =>
            categories.map((cat, i) => ({
                ...cat,
                from: GRADIENTS[i % GRADIENTS.length][0],
                to:   GRADIENTS[i % GRADIENTS.length][1],
                icon: ICONS[i % ICONS.length],
            })),
        [categories]
    );

    return (
        <section className={style.section}>
            <div className={style.header}>
                <div>
                    <h2 className={style.title}>Browse by Category</h2>
                    <p className={style.subtitle}>Find exactly what you're looking for</p>
                </div>
                <Link href="/apps" className={style.viewAll}>View All →</Link>
            </div>

            {isLoading ? (
                <div className={style.grid}>
                    {SKELETON_ITEMS.map(i => <div key={i} className={style.skeleton} />)}
                </div>
            ) : categoriesWithMeta.length === 0 ? (
                <div className={style.empty}>No categories found.</div>
            ) : (
                <div className={style.grid}>
                    {categoriesWithMeta.map(cat => (
                        <CategoryCard key={cat.id} cat={cat} />
                    ))}
                </div>
            )}
        </section>
    );
});

// Мемоизированная карточка — не перерендеривается если cat не изменился
const CategoryCard = memo(function CategoryCard({
    cat,
}: {
    cat: Category & { from: string; to: string; icon: React.ReactNode };
}) {
    return (
        <Link
            href={`/apps?categoryId=${cat.id}`}
            className={style.card}
            style={{ "--from": cat.from, "--to": cat.to } as React.CSSProperties}
        >
            <div className={style.cardGlow} />
            <div className={style.iconWrap}>{cat.icon}</div>
            <span className={style.cardName}>{cat.name}</span>
            <svg className={style.cardArrow} width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </Link>
    );
});
