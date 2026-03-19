import Link from "next/link";
import { App } from "../../../types/Entities";
import { calculateFinalPrice } from "../../../lib/utils";
import style from "./AppCard.module.scss";
import React, { memo } from "react";
import { PlatformIcon } from "../PlatformIcon/PlatformIcon";
import { StarRating } from "../StarRating/StarRating";

interface Props {
    app: App;
}

export const AppCard: React.FC<Props> = memo(({ app }) => {
    const basePrice = Number(app.price);
    const activePromotion = app.promotions?.[0]?.isActive ? app.promotions[0] : null;
    const finalPrice = calculateFinalPrice(basePrice, activePromotion);
    const isFree = basePrice === 0;
    const hasDiscount = !isFree && finalPrice < basePrice;
    const discountPercent = hasDiscount ? Math.round((1 - finalPrice / basePrice) * 100) : 0;

    const platforms = Array.isArray(app.platform)
        ? app.platform
        : app.platform ? [app.platform] : [];

    return (
        <Link href={app.slug ? `/apps/${app.slug}` : '/apps'} className={style.card}>
            <div className={style.glow} />
            <div className={style.coverWrap}>
                {app.coverUrl
                    ? <img src={app.coverUrl} alt={app.name} className={style.cover} />
                    : <div className={style.coverFallback}>
                        <img src={app.iconUrl} alt={app.name} className={style.coverFallbackIcon} />
                    </div>
                }
                <div className={style.coverOverlay} />

                <div className={style.coverTopRow}>
                    <span className={`${style.statusPill} ${app.status === "BETA" ? style.statusBeta : style.statusRelease}`}>
                        {app.status === "BETA" ? "Beta" : "Released"}
                    </span>
                    {hasDiscount && (
                        <span className={style.discountBadge}>−{discountPercent}%</span>
                    )}
                </div>

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

            <div className={style.body}>
                <div className={style.appHeader}>
                    <div className={style.iconWrap}>
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
                        {isFree ? (
                            <span className={style.priceFree}>Free</span>
                        ) : (
                            <div className={style.priceGroup}>
                                <span className={`${style.priceAmt} ${hasDiscount ? style.priceGreen : ''}`}>
                                    {finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <small>USD</small>
                                </span>
                                {hasDiscount && (
                                    <span className={`${style.priceOriginal} ${style.priceRed}`}>${basePrice.toFixed(2)}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <p className={style.desc}>{app.shortDesc}</p>

                {app.tags?.length > 0 && (
                    <div className={style.tags}>
                        {app.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={style.tag}>{tag}</span>
                        ))}
                    </div>
                )}

                <div className={style.footer}>
                    <div className={style.ratingRow}>
                        <StarRating
                            rating={app.rating}
                            className={style.stars}
                            fullClassName={style.starFull}
                            halfClassName={style.starHalf}
                            emptyClassName={style.starEmpty}
                        />
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
