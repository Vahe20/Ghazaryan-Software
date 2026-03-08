"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import {useCreateReviewMutation,useGetAppBySlugQuery,useGetAppPromotionsQuery,useGetAppEditionsQuery} from "@/src/features/api/appsApi";
import { usePurchaseAppMutation } from "@/src/features/api/paymentApi";
import { setUser } from "@/src/features/slices/authSlice";
import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { PlatformIcon, getPlatformLabel } from "@/src/components/shared/PlatformIcon/PlatformIcon";
import { StarRating } from "@/src/components/shared/StarRating/StarRating";
import { calculateFinalPrice, extractErrorMessage } from "@/src/lib/utils";
import style from "./page.module.scss";

export default function AppPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { data: app, isLoading, error } = useGetAppBySlugQuery(slug);
    const { data: promotions } = useGetAppPromotionsQuery(
        { appId: app?.id ?? "", activeOnly: true },
        { skip: !app }
    );
    const { data: editions } = useGetAppEditionsQuery(app?.id ?? "", { skip: !app });

    const user = useAppSelector((s) => s.auth.user);
    const [purchaseApp, { isLoading: purchasing, error: purchaseError }] = usePurchaseAppMutation();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingPurchase, setPendingPurchase] = useState<{ id: string; name: string; price: number } | null>(
        null
    );
    const [activeScreenshot, setActiveScreenshot] = useState(0);

    const handlePurchaseClick = (id: string, name: string, price: number) => {
        if (!user) {
            router.push("/auth");
            return;
        }

        setPendingPurchase({ id, name, price });
        setConfirmModalOpen(true);
    };

    const handleConfirmPurchase = async () => {
        if (!pendingPurchase || !user) return;

        try {
            const result = await purchaseApp(pendingPurchase.id).unwrap();
            dispatch(
                setUser({
                    ...user,
                    balance: result.balance,
                    purchases: [...(user.purchases || []), result.purchase],
                })
            );
            setConfirmModalOpen(false);
            setPendingPurchase(null);
        } catch {
        }
    };

    if (isLoading) {
        return (
            <div className={style.loadingPage}>
                <svg className={style.spinner} viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" />
                    <path d="M25 5 A20 20 0 0 1 45 25" fill="none" />
                </svg>
                <p>Loading application...</p>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className={style.errorPage}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h2>Application not found</h2>
                <p>This app might have been removed or the link is incorrect.</p>
                <button onClick={() => router.push("/apps")} className={style.backBtn}>
                     Back to Apps
                </button>
            </div>
        );
    }

    const activePromotion = promotions?.[0];
    const basePrice = Number(app.price);
    const finalPrice = calculateFinalPrice(basePrice, activePromotion);
    const hasDiscount = finalPrice < basePrice;
    const discountPercent = hasDiscount ? Math.round((1 - finalPrice / basePrice) * 100) : 0;
    const isFree = basePrice === 0;

    const isPurchased = user?.purchases?.some((p) => p.appId === app.id);
    const reviews = app?.reviews ?? [];
    const purchaseErrorMsg = purchaseError ? extractErrorMessage(purchaseError, "Purchase failed") : null;
    const screenshots = app.screenshots ?? [];

    return (
        <div className={style.appPage}>
            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmPurchase}
                title="Confirm Purchase"
                description={
                    pendingPurchase ? (
                        <div>
                            <p>
                                Purchase <strong>{pendingPurchase.name}</strong>?
                            </p>
                            <p className={style.modalPrice}>${pendingPurchase.price.toFixed(2)}</p>
                            {purchaseErrorMsg && <p className={style.modalError}>{purchaseErrorMsg}</p>}
                        </div>
                    ) : null
                }
                loading={purchasing}
                error={purchaseErrorMsg}
                confirmLabel="Confirm Purchase"
                cancelLabel="Cancel"
            />

            <div className={style.topBar}>
                <button onClick={() => router.back()} className={style.backNavBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M19 12H5M12 19l-7-7 7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Back
                </button>
            </div>

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
                            <button onClick={() => router.push("/library")} className={style.libraryBtn}>
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
                                    onClick={() => handlePurchaseClick(app.id, app.name, finalPrice)}
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

            <div className={style.appContent}>
                {screenshots.length > 0 && (
                    <section className={style.section}>
                        <h2 className={style.sectionTitle}>Screenshots</h2>
                        <div className={style.screenshotViewer}>
                            <div className={style.screenshotMain}>
                                <img
                                    key={activeScreenshot}
                                    src={screenshots[activeScreenshot]}
                                    alt={`${app.name} screenshot ${activeScreenshot + 1}`}
                                    className={style.screenshotBig}
                                />

                                {screenshots.length > 1 && (
                                    <>
                                        <button
                                            className={`${style.ssNav} ${style.ssNavPrev}`}
                                            onClick={() => setActiveScreenshot((i) => (i - 1 + screenshots.length) % screenshots.length)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M15 18l-6-6 6-6"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>

                                        <button
                                            className={`${style.ssNav} ${style.ssNavNext}`}
                                            onClick={() => setActiveScreenshot((i) => (i + 1) % screenshots.length)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M9 18l6-6-6-6"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>

                                        <div className={style.ssDots}>
                                            {screenshots.map((_, i) => (
                                                <button
                                                    key={i}
                                                    className={`${style.ssDot} ${i === activeScreenshot ? style.ssDotActive : ""}`}
                                                    onClick={() => setActiveScreenshot(i)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {screenshots.length > 1 && (
                                <div className={style.screenshotThumbs}>
                                    {screenshots.map((src, i) => (
                                        <button
                                            key={i}
                                            className={`${style.ssThumbnail} ${i === activeScreenshot ? style.ssThumbnailActive : ""}`}
                                            onClick={() => setActiveScreenshot(i)}
                                        >
                                            <img src={src} alt={`Screenshot ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {editions && editions.length > 0 && (
                    <section className={style.section}>
                        <h2 className={style.sectionTitle}>Available Editions</h2>
                        <div className={style.editionsList}>
                            {editions.map((edition) => {
                                const editionBase = Number(edition.price);
                                const editionFinal = calculateFinalPrice(editionBase, activePromotion);
                                const editionHasDiscount = editionFinal < editionBase;
                                const editionPct = editionHasDiscount ? Math.round((1 - editionFinal / editionBase) * 100) : 0;

                                return (
                                    <div key={edition.id} className={style.editionCard}>
                                        <div className={style.editionInfo}>
                                            <Link href={`/apps/${edition.slug}`} className={style.editionName}>
                                                {edition.name}
                                            </Link>
                                            {edition.shortDesc && <p className={style.editionDesc}>{edition.shortDesc}</p>}
                                        </div>

                                        <div className={style.editionPriceRow}>
                                            {editionHasDiscount && <span className={style.discountPill}>-{editionPct}%</span>}

                                            <div className={style.priceStack}>
                                                {editionHasDiscount && <span className={style.oldPriceSm}>${editionBase.toFixed(2)}</span>}
                                                <span className={style.newPriceSm}>${editionFinal.toFixed(2)}</span>
                                            </div>

                                            <button
                                                onClick={() => handlePurchaseClick(edition.id, edition.name, editionFinal)}
                                                disabled={purchasing}
                                                className={style.buyBtnSm}
                                            >
                                                {purchasing ? "..." : "Buy"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>About</h2>
                    <p className={style.aboutText}>{app.description}</p>

                    <div className={style.aboutMeta}>
                        {app.createdAt && (
                            <div className={style.metaItem}>
                                <span className={style.metaKey}>Release Date</span>
                                <span className={style.metaVal}>
                                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}

                        {app.size > 0 && (
                            <div className={style.metaItem}>
                                <span className={style.metaKey}>Size</span>
                                <span className={style.metaVal}>{(app.size / 1_048_576).toFixed(1)} MB</span>
                            </div>
                        )}

                        {app.minVersion && (
                            <div className={style.metaItem}>
                                <span className={style.metaKey}>Min Version</span>
                                <span className={style.metaVal}>{app.minVersion}</span>
                            </div>
                        )}

                        {app.sourceUrl && (
                            <div className={style.metaItem}>
                                <span className={style.metaKey}>Source</span>
                                <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className={style.metaLink}>
                                    GitHub ↗
                                </a>
                            </div>
                        )}

                        {app.documentationUrl && (
                            <div className={style.metaItem}>
                                <span className={style.metaKey}>Docs</span>
                                <a
                                    href={app.documentationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={style.metaLink}
                                >
                                    Documentation ↗
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {app.versions && app.versions.length > 0 && (
                    <section className={style.section}>
                        <h2 className={style.sectionTitle}>Changelog</h2>
                        <div className={style.timeline}>
                            {app.versions.map((version, i) => (
                                <div key={version.id} className={style.timelineItem}>
                                    <div className={style.timelineDot} />
                                    {app.versions && i < app.versions.length - 1 && <div className={style.timelineLine} />}

                                    <div className={style.timelineContent}>
                                        <div className={style.timelineHeader}>
                                            <span className={style.versionTag}>{version.version}</span>
                                            <span className={style.versionStatus}>{version.status}</span>
                                            <span className={style.versionDate}>
                                                {new Date(version.releaseDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {version.changelog && (
                                            <p className={style.versionChangelog}>{version.changelog}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>
                        Reviews <span className={style.reviewCountBadge}>{reviews.length}</span>
                    </h2>

                    {reviews.length > 0 ? (
                        <div className={style.reviewsGrid}>
                            {reviews.map((review) => (
                                <div key={review.id} className={style.reviewCard}>
                                    <div className={style.reviewTop}>
                                        <div className={style.reviewAvatar}>
                                            {review.user?.avatarUrl ? (
                                                <img src={review.user.avatarUrl} alt={review.user.userName} />
                                            ) : (
                                                review.user?.userName?.[0]?.toUpperCase() || "U"
                                            )}       
                                        </div>

                                        <div className={style.reviewMeta}>
                                            <span className={style.reviewerName}>{review.user?.userName ?? "Unknown"}</span>
                                            <span className={style.reviewDate}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className={style.reviewStars}>
                                            <StarRating rating={review.rating} />
                                            <span className={style.reviewRatingNum}>{review.rating}/5</span>
                                        </div>
                                    </div>

                                    {review.title && <h4 className={style.reviewTitle}>{review.title}</h4>}
                                    <p className={style.reviewComment}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={style.emptyReviews}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p>No reviews yet. Be the first!</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
