"use client";

import { PlatformIcon, getPlatformLabel } from "@/src/components/shared/PlatformIcon/PlatformIcon";
import { StarRating } from "@/src/components/shared/StarRating/StarRating";
import type { App, AppPromotion } from "@/src/types/Entities";
import style from "./HeroSection.module.scss";

interface HeroSectionProps {
    app: App;
    isPurchased: boolean | undefined;
    hasDiscount: boolean;
    discountPercent: number;
    isFree: boolean;
    basePrice: number;
    finalPrice: number;
    activePromotion?: AppPromotion;
    purchasing: boolean;
    onPurchase: (id: string, name: string, price: number) => void;
    onOpenLibrary: () => void;
}

export function HeroSection({
    app,
    isPurchased,
    hasDiscount,
    discountPercent,
    isFree,
    basePrice,
    finalPrice,
    activePromotion,
    purchasing,
    onPurchase,
    onOpenLibrary,
}: HeroSectionProps) {
    return (
        <div className={style.hero}>
            <div className={style.heroBg}>
                {app.coverUrl && <img src={app.coverUrl} alt="" className={style.heroBgImg} />}
                <div className={style.heroBgOverlay} />
            </div>

            <div className={style.heroContent}>
                <div className={style.heroIcon}>
                    <img src={app.iconUrl} alt={app.name} />
                </div>

                <div className={style.heroInfo}>
                    <div className={style.heroMeta}>
                        <span
                            className={`${style.statusBadge} ${app.status === "BETA" ? style.statusBeta : style.statusRelease}`}
                        >
                            {app.status === "BETA" ? "Beta" : "Released"}
                        </span>
                        {app.category && <span className={style.categoryBadge}>{app.category.name}</span>}
                    </div>

                    <h1 className={style.heroTitle}>{app.name}</h1>
                    <p className={style.heroDesc}>{app.shortDesc}</p>

                    <div className={style.heroStats}>
                        <div className={style.heroStat}>
                            <StarRating
                                rating={app.rating}
                                size={14}
                                className={style.stars}
                                fullClassName={style.starOn}
                                halfClassName={style.starOn}
                                emptyClassName={style.starOff}
                            />
                            <span className={style.heroStatVal}>{app.rating.toFixed(1)}</span>
                            <span className={style.heroStatSub}>({app.reviewCount})</span>
                        </div>

                        <div className={style.heroStatDivider} />

                        <div className={style.heroStat}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className={style.heroStatVal}>{app.downloadCount.toLocaleString()}</span>
                            <span className={style.heroStatSub}>downloads</span>
                        </div>

                        {app.author && (
                            <>
                                <div className={style.heroStatDivider} />
                                <div className={style.heroStat}>
                                    <span className={style.heroStatSub}>by</span>
                                    <span className={style.heroStatVal}>{app.author.userName}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={style.heroPlatforms}>
                        {app.platform?.map((p) => (
                            <span key={p} className={style.platformBadge}>
                                <PlatformIcon platform={p} size={12} />
                                {getPlatformLabel(p)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={style.heroPurchase}>
                    {isPurchased ? (
                        <button onClick={onOpenLibrary} className={style.libraryBtn}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Open in Library
                        </button>
                    ) : (
                        <div className={style.buyBlock}>
                            {hasDiscount && (
                                <div className={style.discountChip}>
                                    <span className={style.discountPct}>-{discountPercent}%</span>
                                    {activePromotion?.label && (
                                        <span className={style.discountLabel}>{activePromotion.label}</span>
                                    )}
                                    {activePromotion?.endsAt && (
                                        <span className={style.discountExpiry}>
                                            until {new Date(activePromotion.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className={style.priceRow}>
                                {hasDiscount && <span className={style.oldPrice}>${basePrice.toFixed(2)}</span>}
                                <span className={style.newPrice}>{isFree ? "Free" : `$${finalPrice.toFixed(2)}`}</span>
                            </div>

                            <button
                                onClick={() => onPurchase(app.id, app.name, finalPrice)}
                                disabled={purchasing}
                                className={style.buyBtn}
                            >
                                {purchasing ? "Processing..." : isFree ? "Get Free" : "Buy Now"}
                            </button>
                        </div>
                    )}

                    {app.tags.length > 0 && (
                        <div className={style.heroTags}>
                            {app.tags.map((tag) => (
                                <span key={tag} className={style.tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
