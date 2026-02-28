import Link from "next/link";
import { App } from "../../../types/Entities";
import style from "./AppCard.module.scss";
import React, { memo } from "react";

interface Props {
    app: App;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
    const p = platform?.toUpperCase();
    if (p === "WINDOWS") return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
        </svg>
    );
    if (p === "MAC") return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
    if (p === "LINUX") return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.504 0c-.155 0-.315.008-.48.021C7.27.324 3.498 2.58 3.498 7.5c0 1.059.262 2.03.714 2.904C3.507 11.978 3 13.5 3 15c0 2.089.906 3.934 2.345 5.207C5.127 21.215 4.5 22.5 4.5 24h15c0-1.5-.627-2.785-.845-3.793C20.094 18.934 21 17.089 21 15c0-1.5-.507-3.022-1.212-4.596C20.24 9.53 20.502 8.559 20.502 7.5c0-4.92-3.772-7.176-8.026-7.479C12.817.009 12.659 0 12.504 0z" />
        </svg>
    );
    if (p === "ANDROID") return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 15.341c-.614 0-1.111-.498-1.111-1.111s.497-1.111 1.111-1.111c.614 0 1.111.498 1.111 1.111s-.497 1.111-1.111 1.111m-11.046 0c-.614 0-1.111-.498-1.111-1.111s.497-1.111 1.111-1.111c.614 0 1.111.498 1.111 1.111s-.497 1.111-1.111 1.111m11.405-6.023l1.976-3.422a.411.411 0 00-.15-.562.411.411 0 00-.562.15l-2.003 3.467A11.929 11.929 0 0012 8.307a11.927 11.927 0 00-5.143 1.144L4.854 5.984a.411.411 0 00-.562-.15.411.411 0 00-.15.562l1.976 3.422C3.498 11.285 2 13.718 2 16.5h20c0-2.782-1.498-5.215-4.118-7.182" />
        </svg>
    );
    if (p === "IOS") return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
    return null;
};

const StarRating = ({ rating }: { rating: number }) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
        <div className={style.stars}>
            {[1, 2, 3, 4, 5].map(s => (
                <svg
                    key={s}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill={
                        s <= full
                            ? "currentColor"
                            : s === full + 1 && half
                                ? "url(#half)"
                                : "none"
                    }
                    className={
                        s <= full
                            ? style.starFull
                            : s === full + 1 && half
                                ? style.starHalf
                                : style.starEmpty
                    }
                >
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ))}
        </div>
    );
};

export const AppCard: React.FC<Props> = memo(({ app }) => {
    const isFree = !app.price || Number(app.price) === 0;
    const platforms = Array.isArray(app.platform)
        ? app.platform
        : app.platform ? [app.platform] : [];

    return (
        <Link href={`/apps/${app.slug}`} className={style.card}>
            <div className={style.glow} />
            <div className={style.coverWrap}>
                {app.coverUrl
                    ? <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={app.coverUrl} alt={app.name} className={style.cover} />
                    </>
                    : <div className={style.coverFallback}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={app.iconUrl} alt={app.name} className={style.coverFallbackIcon} />
                    </div>
                }
                <div className={style.coverOverlay} />

                { }
                <span className={`${style.statusPill} ${app.status === "BETA" ? style.statusBeta : style.statusRelease}`}>
                    {app.status === "BETA" ? "Beta" : "Released"}
                </span>

                { }
                {platforms.length > 0 && (
                    <div className={style.platforms}>
                        {platforms.slice(0, 3).map((p: string) => (
                            <span key={p} className={style.platformIcon} title={p}>
                                <PlatformIcon platform={p} />
                            </span>
                        ))}
                        {platforms.length > 3 && (
                            <span className={style.platformIcon}>+{platforms.length - 3}</span>
                        )}
                    </div>
                )}
            </div>

            { }
            <div className={style.body}>

                { }
                <div className={style.appHeader}>
                    <div className={style.iconWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={app.iconUrl} alt={app.name} className={style.icon} />
                        <div className={style.iconShine} />
                    </div>
                    <div className={style.appMeta}>
                        <h3 className={style.name}>{app.name}</h3>
                        <span className={style.category}>
                            <span className={style.categoryDot} />
                            {app.category?.name}
                        </span>
                    </div>
                    <div className={style.priceTag}>
                        {isFree
                            ? <span className={style.priceFree}>Free</span>
                            : <span className={style.priceAmt}>{Number(app.price).toLocaleString()}<small>USD</small></span>
                        }
                    </div>
                </div>

                { }
                <p className={style.desc}>{app.shortDesc}</p>

                { }
                {app.tags?.length > 0 && (
                    <div className={style.tags}>
                        {app.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={style.tag}>{tag}</span>
                        ))}
                    </div>
                )}

                { }
                <div className={style.footer}>
                    <div className={style.ratingRow}>
                        <StarRating rating={app.rating} />
                        <span className={style.ratingValue}>{app.rating.toFixed(1)}</span>
                        <span className={style.ratingCount}>({app.reviewCount})</span>
                    </div>
                    <div className={style.downloads}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {app.downloadCount.toLocaleString()}
                    </div>
                </div>

                { }
                <div className={style.cta}>
                    <span className={style.ctaText}>View App</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </Link>
    );
});

AppCard.displayName = "AppCard";
