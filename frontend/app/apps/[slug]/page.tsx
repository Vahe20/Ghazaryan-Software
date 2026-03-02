"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { useGetAppBySlugQuery, useCreateReviewMutation } from "@/src/features/api/appsApi";
import { usePurchaseAppMutation } from "@/src/features/api/paymentApi";
import { formatDate, formatSize, extractErrorMessage } from "@/src/lib/utils";
import { setUser } from "@/src/features/slices/authSlice";
import style from "./page.module.scss";

interface ReviewFormValues {
    title: string;
    comment: string;
}

export default function AppPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { data: app, isLoading, error } = useGetAppBySlugQuery(slug);
    const user = useAppSelector(s => s.auth.user);

    const [activeTab, setActiveTab] = useState<"overview" | "screenshots" | "reviews" | "changelog">("overview");
    const [activeScreenshot, setActiveScreenshot] = useState(0);

    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [purchaseApp, { isLoading: purchasing, error: purchaseError }] = usePurchaseAppMutation();

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [createReview, { isLoading: reviewLoading, error: reviewError }] = useCreateReviewMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ReviewFormValues>({ mode: "onChange" });

    const alreadyOwned = user?.purchases?.some(p => p.app?.id === app?.id || p.appId === app?.id);
    const isFree = !app?.price || Number(app.price) === 0;

    const handlePurchase = async () => {
        if (!user) { router.push("/auth"); return; }
        if (!app) return;
        try {
            const result = await purchaseApp(app.id).unwrap();
            dispatch(setUser({ ...user, balance: result.balance }));
            setPurchaseSuccess(true);
        } catch {
            return;
        }
    };

    const onReviewSubmit = async (values: ReviewFormValues) => {
        if (!app || reviewRating === 0) return;
        try {
            await createReview({
                appId: app.id,
                rating: reviewRating,
                title: values.title || undefined,
                comment: values.comment,
            }).unwrap();
            setReviewSuccess(true);
            setReviewRating(0);
            reset();
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch {
            return;
        }
    };

    if (isLoading) {
        return (
            <div className={style.loadingPage}>
                <svg className={style.loadingSpinner} viewBox="0 0 50 50">
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
    const reviews = app.reviews ?? [];

    return (
        <div className={style.page}>
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
                                        {p.charAt(0) + p.slice(1).toLowerCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={style.cta}>
                            <div className={style.ctaPrice}>
                                {isFree ? (
                                    <span className={style.priceFree}>Free</span>
                                ) : (
                                    <>
                                        <span className={style.priceAmount}>{Number(app.price).toLocaleString()}</span>
                                        <span className={style.priceCurrency}>USD</span>
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
                                    {purchaseError && <p className={style.ctaError}>{extractErrorMessage(purchaseError, "Purchase failed")}</p>}
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
                                {app.createdAt && <><span>·</span><span>{formatDate(app.createdAt)}</span></>}
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

                    {activeTab === "overview" && (
                        <div className={style.overviewGrid}>
                            <div className={style.descriptionCard}>
                                <h2>About</h2>
                                <p className={style.description}>{app.description}</p>

                                {app.tags?.length > 0 && (
                                    <div className={style.tags}>
                                        {app.tags.map((tag: string) => (
                                            <span key={tag} className={style.tag}>
                                                {tag}
                                            </span>
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
                                            <dd>{formatDate((app).createdAt)}</dd>
                                        </div>
                                        <div className={style.infoItem}>
                                            <dt>Platforms</dt>
                                            <dd>{platforms.join(", ")}</dd>
                                        </div>
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
                                        <span>{(app).viewCount?.toLocaleString() ?? "—"}</span>
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

                    {activeTab === "reviews" && (
                        <div className={style.reviewsSection}>

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

                            {user && (
                                <div className={style.reviewForm}>
                                    <h3>Leave a Review</h3>
                                    <form onSubmit={handleSubmit(onReviewSubmit)}>
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
                                            {reviewRating === 0 && (
                                                <span className={style.ratingHint}>Select a rating</span>
                                            )}
                                        </div>

                                        <div className={style.reviewFormFields}>
                                            <input
                                                type="text"
                                                placeholder="Title (optional)"
                                                className={style.reviewInput}
                                                {...register("title")}
                                            />
                                            <textarea
                                                placeholder="Share your experience..."
                                                rows={4}
                                                className={style.reviewTextarea}
                                                {...register("comment", { required: "Comment is required" })}
                                            />
                                            {errors.comment && (
                                                <span className={style.fieldError}>{errors.comment.message}</span>
                                            )}
                                        </div>

                                        <div className={style.reviewFormFooter}>
                                            <button
                                                type="submit"
                                                className={style.reviewSubmitBtn}
                                                disabled={reviewLoading || reviewRating === 0 || !isValid}
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
                                                    {extractErrorMessage(reviewError, "Failed to submit review")}
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div>
                                <div className={style.reviewsListHeader}>
                                    <h3>All Reviews</h3>
                                </div>
                                <div className={style.reviewsList}>
                                    {reviews.length === 0 ? (
                                        <div className={style.empty}><p>No reviews yet. Be the first!</p></div>
                                    ) : (
                                        reviews.map((r) => (
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

                    {activeTab === "changelog" && (
                        <div className={style.changelogSection}>
                            {app.changelog ? (
                                <div className={style.changelogCard}>
                                    <div className={style.changelogVersion}>
                                        <span className={style.versionBadge}>v{app.version}</span>
                                        <span className={style.changelogDate}>{formatDate((app).updatedAt)}</span>
                                    </div>
                                    <pre className={style.changelogText}>{app.changelog}</pre>
                                </div>
                            ) : (
                                <div className={style.empty}><p>No changelog available</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
