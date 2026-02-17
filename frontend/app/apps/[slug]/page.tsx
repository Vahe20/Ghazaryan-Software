"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppBySlug } from "@/src/hooks/queries/useApps";
import { useAuthStore } from "@/src/store/AuthStore";
import { PaymentService } from "@/src/services/payment.service";
import { ReviewService } from "@/src/services/review.service";
import { useQueryClient } from "@tanstack/react-query";
import { appsKeys } from "@/src/hooks/queries/useApps";
import style from "./page.module.scss";

const PLATFORM_ICONS: Record<string, string> = {
    WINDOWS: "🪟",
    MAC: "🍎",
    LINUX: "🐧",
    ANDROID: "🤖",
    IOS: "📱",
};

function formatSize(bytes: number): string {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
}

function formatDate(date?: Date | string): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export default function AppPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: app, isLoading, error } = useAppBySlug(slug);
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<"overview" | "screenshots" | "reviews" | "changelog">("overview");
    const [activeScreenshot, setActiveScreenshot] = useState(0);

    // Purchase state
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    // Review state
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    const alreadyOwned = user?.purchases?.some(p => p.app?.id === app?.id || (p as any).appId === app?.id);
    const isFree = !app?.price || Number(app.price) === 0;

    const handlePurchase = async () => {
        if (!user) { router.push("/auth/login"); return; }
        if (!app) return;
        setPurchasing(true);
        setPurchaseError(null);
        try {
            await PaymentService.purchaseApp(app.id);
            setPurchaseSuccess(true);
            queryClient.invalidateQueries({ queryKey: appsKeys.detail(slug) });
        } catch (err: any) {
            setPurchaseError(err.response?.data?.error?.message || "Purchase failed");
        } finally {
            setPurchasing(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!app || reviewRating === 0) return;
        setReviewLoading(true);
        setReviewError(null);
        try {
            await ReviewService.createReview(app.id, {
                rating: reviewRating,
                title: reviewTitle || undefined,
                comment: reviewComment,
            });
            setReviewSuccess(true);
            setReviewRating(0);
            setReviewComment("");
            setReviewTitle("");
            queryClient.invalidateQueries({ queryKey: appsKeys.detail(slug) });
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch (err: any) {
            setReviewError(err.response?.data?.error?.message || "Failed to submit review");
        } finally {
            setReviewLoading(false);
        }
    };

    // ── Loading ─────────────────────────────────────────
    if (isLoading) {
        return (
            <div className={style.loadingPage}>
                <div className={style.loadingSpinner} />
                <p>Loading application...</p>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className={style.errorPage}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h2>Application not found</h2>
                <button onClick={() => router.push("/apps")} className={style.backBtn}>
                    Back to Apps
                </button>
            </div>
        );
    }

    const platforms = Array.isArray(app.platform) ? app.platform : [app.platform].filter(Boolean);
    const screenshots = app.screenshots ?? [];
    const reviews = (app as any).reviews ?? [];

    return (
        <div className={style.page}>

            {/* ── HERO ─────────────────────────────────────── */}
            <div className={style.hero}>
                <div className={style.heroBg}>
                    {app.coverUrl && <img src={app.coverUrl} alt="" aria-hidden />}
                </div>
                <div className={style.heroContent}>
                    <button onClick={() => router.back()} className={style.breadcrumb}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </button>

                    <div className={style.heroMain}>
                        <div className={style.appIcon}>
                            <img src={app.iconUrl} alt={app.name} />
                        </div>

                        <div className={style.heroInfo}>
                            <div className={style.heroBadges}>
                                <span className={`${style.badge} ${app.status === "RELEASE" ? style.badgeRelease : style.badgeBeta}`}>
                                    {app.status === "RELEASE" ? "Released" : "Beta"}
                                </span>
                                {app.featured && <span className={`${style.badge} ${style.badgeFeatured}`}>⭐ Featured</span>}
                                <span className={style.badge}>{app.category?.name}</span>
                            </div>

                            <h1 className={style.appName}>{app.name}</h1>
                            <p className={style.appShortDesc}>{app.shortDesc}</p>

                            <div className={style.heroMeta}>
                                <span className={style.metaItem}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {app.rating.toFixed(1)} ({app.reviewCount} reviews)
                                </span>
                                <span className={style.metaItem}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {app.downloadCount.toLocaleString()} downloads
                                </span>
                                <span className={style.metaItem}>v{app.version}</span>
                            </div>

                            <div className={style.platforms}>
                                {platforms.map((p: string) => (
                                    <span key={p} className={style.platformTag}>
                                        {PLATFORM_ICONS[p] ?? "💻"} {p.charAt(0) + p.slice(1).toLowerCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── CTA ─────────────────────────── */}
                        <div className={style.cta}>
                            <div className={style.ctaPrice}>
                                {isFree ? (
                                    <span className={style.priceFree}>Free</span>
                                ) : (
                                    <>
                                        <span className={style.priceAmount}>{Number(app.price).toLocaleString()}</span>
                                        <span className={style.priceCurrency}>AMD</span>
                                    </>
                                )}
                            </div>

                            {purchaseSuccess || alreadyOwned ? (
                                <div className={style.ownedBlock}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    You own this app
                                </div>
                            ) : (
                                <>
                                    {purchaseError && <p className={style.ctaError}>{purchaseError}</p>}
                                    <button
                                        className={style.buyBtn}
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                    >
                                        {purchasing ? (
                                            <><span className={style.btnSpinner} /> Processing...</>
                                        ) : isFree ? (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Get for Free</>
                                        ) : (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Buy Now</>
                                        )}
                                    </button>
                                </>
                            )}

                            <div className={style.ctaMeta}>
                                <span>{formatSize(app.size)}</span>
                                <span>·</span>
                                <span>v{app.version}</span>
                                {app.publishedAt && <><span>·</span><span>{formatDate((app as any).publishedAt)}</span></>}
                            </div>

                            <div className={style.ctaLinks}>
                                {app.sourceUrl && (
                                    <a href={app.sourceUrl} target="_blank" rel="noreferrer" className={style.ctaLink}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Source
                                    </a>
                                )}
                                {app.documentationUrl && (
                                    <a href={app.documentationUrl} target="_blank" rel="noreferrer" className={style.ctaLink}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Docs
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TABS ─────────────────────────────────────── */}
            <div className={style.container}>
                <div className={style.tabs}>
                    {(["overview", "screenshots", "reviews", "changelog"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${style.tab} ${activeTab === tab ? style.tabActive : ""}`}
                        >
                            {tab === "screenshots" && `Screenshots (${screenshots.length})`}
                            {tab === "reviews" && `Reviews (${app.reviewCount})`}
                            {tab !== "screenshots" && tab !== "reviews" && tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className={style.tabContent}>

                    {/* ── OVERVIEW ──────────────────────────── */}
                    {activeTab === "overview" && (
                        <div className={style.overviewGrid}>
                            <div className={style.descriptionCard}>
                                <h2>About</h2>
                                <p className={style.description}>{app.description}</p>

                                {app.tags?.length > 0 && (
                                    <div className={style.tags}>
                                        {app.tags.map((tag: string) => (
                                            <span key={tag} className={style.tag}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={style.sidebar}>
                                <div className={style.infoCard}>
                                    <h3>Details</h3>
                                    <dl className={style.infoList}>
                                        <div className={style.infoItem}>
                                            <dt>Version</dt>
                                            <dd>{app.version}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Size</dt>
                                            <dd>{formatSize(app.size)}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Category</dt>
                                            <dd>{app.category?.name}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Status</dt>
                                            <dd>{app.status === "RELEASE" ? "Released" : "Beta"}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Published</dt>
                                            <dd>{formatDate((app as any).publishedAt)}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Platforms</dt>
                                            <dd>{platforms.join(", ")}</dd>
                                        </div>
                                        {app.minVersion && (
                                            <div className={style.infoItem}>
                                                <dt>Min. version</dt>
                                                <dd>{app.minVersion}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                <div className={style.statsCard}>
                                    <div className={style.statRow}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>{app.downloadCount.toLocaleString()}</span>
                                        <small>Downloads</small>
                                    </div>
                                    <div className={style.statRow}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        <span>{(app as any).viewCount?.toLocaleString() ?? "—"}</span>
                                        <small>Views</small>
                                    </div>
                                    <div className={style.statRow}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>{app.rating.toFixed(1)}</span>
                                        <small>Rating</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SCREENSHOTS ───────────────────────── */}
                    {activeTab === "screenshots" && (
                        <div className={style.screenshotsSection}>
                            {screenshots.length === 0 ? (
                                <div className={style.empty}>
                                    <p>No screenshots available</p>
                                </div>
                            ) : (
                                <>
                                    <div className={style.screenshotMain}>
                                        <img src={screenshots[activeScreenshot]} alt={`Screenshot ${activeScreenshot + 1}`} />
                                    </div>
                                    <div className={style.screenshotThumbs}>
                                        {screenshots.map((src: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveScreenshot(i)}
                                                className={`${style.thumb} ${i === activeScreenshot ? style.thumbActive : ""}`}
                                            >
                                                <img src={src} alt={`Thumbnail ${i + 1}`} />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── REVIEWS ───────────────────── */}
                    {activeTab === "reviews" && (
                        <div className={style.reviewsSection}>

                            {/* Summary banner */}
                            <div className={style.reviewsSummary}>
                                <div className={style.ratingBig}>{app.rating.toFixed(1)}</div>
                                <div className={style.summaryRight}>
                                    <div className={style.ratingStars}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <svg key={s} width="28" height="28" viewBox="0 0 24 24"
                                                fill={s <= Math.round(app.rating) ? "currentColor" : "none"}
                                                className={s <= Math.round(app.rating) ? style.starFilled : style.starEmpty}>
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className={style.summaryCount}>{app.reviewCount} {app.reviewCount === 1 ? "review" : "reviews"}</p>
                                </div>
                            </div>

                            {/* Leave review form */}
                            {user && (
                                <div className={style.reviewForm}>
                                    <h3>Leave a Review</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className={style.starPicker}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onMouseEnter={() => setReviewHover(s)}
                                                    onMouseLeave={() => setReviewHover(0)}
                                                    onClick={() => setReviewRating(s)}
                                                    className={style.starBtn}
                                                >
                                                    <svg width="32" height="32" viewBox="0 0 24 24"
                                                        fill={(reviewHover || reviewRating) >= s ? "currentColor" : "none"}
                                                        className={(reviewHover || reviewRating) >= s ? style.starFilled : style.starEmpty}>
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>

                                        <div className={style.reviewFormFields}>
                                            <input
                                                type="text"
                                                placeholder="Title (optional)"
                                                value={reviewTitle}
                                                onChange={e => setReviewTitle(e.target.value)}
                                                className={style.reviewInput}
                                            />
                                            <textarea
                                                placeholder="Share your experience..."
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                                required
                                                rows={4}
                                                className={style.reviewTextarea}
                                            />
                                        </div>

                                        <div className={style.reviewFormFooter}>
                                            <button
                                                type="submit"
                                                className={style.reviewSubmitBtn}
                                                disabled={reviewLoading || reviewRating === 0 || !reviewComment.trim()}
                                            >
                                                {reviewLoading
                                                    ? <><span className={style.btnSpinner} />Submitting...</>
                                                    : <>Submit Review</>}
                                            </button>

                                            {reviewSuccess && (
                                                <div className={style.reviewSuccess}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Review submitted!
                                                </div>
                                            )}
                                            {reviewError && (
                                                <div className={style.reviewError}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                    {reviewError}
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Reviews list */}
                            <div>
                                <div className={style.reviewsListHeader}>
                                    <h3>All Reviews</h3>
                                </div>
                                <div className={style.reviewsList}>
                                    {reviews.length === 0 ? (
                                        <div className={style.empty}><p>No reviews yet. Be the first!</p></div>
                                    ) : (
                                        reviews.map((r: any) => (
                                            <div key={r.id} className={style.reviewCard}>
                                                <div className={style.reviewHeader}>
                                                    <div className={style.reviewAvatar}>
                                                        {r.user?.avatarUrl
                                                            ? <img src={r.user.avatarUrl} alt={r.user.userName} />
                                                            : <span>{r.user?.userName?.charAt(0).toUpperCase() ?? "?"}</span>}
                                                    </div>
                                                    <div className={style.reviewMeta}>
                                                        <p className={style.reviewUser}>{r.user?.userName ?? "Anonymous"}</p>
                                                        <p className={style.reviewDate}>{formatDate(r.createdAt)}</p>
                                                    </div>
                                                    <div className={style.reviewStars}>
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <svg key={s} width="15" height="15" viewBox="0 0 24 24"
                                                                fill={s <= r.rating ? "currentColor" : "none"}
                                                                className={s <= r.rating ? style.starFilled : style.starEmpty}>
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                {r.title && <p className={style.reviewTitle}>{r.title}</p>}
                                                <p className={style.reviewComment}>{r.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ── CHANGELOG ─────────────────────────── */}
                    {activeTab === "changelog" && (
                        <div className={style.changelogSection}>
                            {app.changelog ? (
                                <div className={style.changelogCard}>
                                    <div className={style.changelogVersion}>
                                        <span className={style.versionBadge}>v{app.version}</span>
                                        <span className={style.changelogDate}>{formatDate((app as any).updatedAt)}</span>
                                    </div>
                                    <pre className={style.changelogText}>{app.changelog}</pre>
                                </div>
                            ) : (
                                <div className={style.empty}><p>No changelog available</p></div>
                            )}

                            {(app as any).versions?.length > 0 && (
                                <div className={style.versionHistory}>
                                    <h3>Version History</h3>
                                    {(app as any).versions.map((v: any) => (
                                        <div key={v.id} className={style.versionCard}>
                                            <div className={style.versionHeader}>
                                                <span className={style.versionBadge}>v{v.version}</span>
                                                <span className={style.changelogDate}>{formatDate(v.releaseDate)}</span>
                                                {!v.isStable && <span className={style.betaBadge}>Beta</span>}
                                            </div>
                                            <pre className={style.changelogText}>{v.changelog}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
