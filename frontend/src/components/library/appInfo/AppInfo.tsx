"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/src/app/hooks";
import {
    useGetAppByIdQuery,
    useRecordDownloadMutation,
    useGetAppReviewsQuery,
    useGetAppPromotionsQuery,
    useCreateReviewMutation,
} from "@/src/features/api/appsApi";
import { formatSize, calculateFinalPrice, extractErrorMessage } from "@/src/lib/utils";
import { StarRating } from "@/src/components/shared/StarRating/StarRating";
import { PlatformIcon, getPlatformLabel } from "@/src/components/shared/PlatformIcon/PlatformIcon";
import BaseModal from "../../shared/BaseModal/BaseModal";
import style from "./AppInfo.module.scss";

export const AppInfo = () => {
    const selectedAppId = useAppSelector(s => s.library.selectedAppId);
    const user = useAppSelector(s => s.auth.user);

    const isValidSelectedAppId = Boolean(
        selectedAppId && selectedAppId !== "undefined" && selectedAppId !== "null"
    );

    const { data: app, isLoading } = useGetAppByIdQuery(selectedAppId ?? "", {
        skip: !isValidSelectedAppId,
    });

    const { data: reviewsData } = useGetAppReviewsQuery(
        { appId: selectedAppId ?? "", page: 1, limit: 50 },
        { skip: !isValidSelectedAppId }
    );

    const { data: promotions } = useGetAppPromotionsQuery(
        { appId: selectedAppId ?? "", activeOnly: true },
        { skip: !isValidSelectedAppId }
    );

    const [recordDownload] = useRecordDownloadMutation();
    const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [reviewError, setReviewError] = useState<string | null>(null);

    const goToNext = useCallback(() => {
        if (app?.screenshots) setCurrentSlide(p => (p + 1) % app.screenshots.length);
    }, [app]);

    const goToPrev = useCallback(() => {
        if (app?.screenshots) setCurrentSlide(p => (p - 1 + app.screenshots.length) % app.screenshots.length);
    }, [app]);

    const openModal = useCallback((index: number) => {
        setCurrentSlide(index);
        setModalIsOpen(true);
    }, []);

    const closeModal = useCallback(() => setModalIsOpen(false), []);

    useEffect(() => {
        if (!modalIsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            else if (e.key === "ArrowRight") goToNext();
            else if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modalIsOpen, goToNext, goToPrev, closeModal]);

    if (!isValidSelectedAppId) {
        return (
            <div className={style.placeholder}>
                <div className={style.placeholder__canvas}>
                    <div className={style.placeholder__ring} aria-hidden />
                    <div className={style.placeholder__ring2} aria-hidden />
                    <svg viewBox="0 0 80 80" fill="none" className={style.placeholder__svg}>
                        <rect x="8" y="8" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="44" y="8" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="8" y="44" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="44" y="44" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </div>
                <h2 className={style.placeholder__title}>Select an app</h2>
                <p className={style.placeholder__sub}>Click on an app from your library to view its details</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={style.loading}>
                <div className={style.loading__spinner} />
            </div>
        );
    }

    if (!app) {
        return (
            <div className={style.placeholder}>
                <p style={{ color: "var(--error, #f02849)" }}>App not found</p>
            </div>
        );
    }

    const downloadUrl = app.versions?.[0]?.downloadUrl;
    const activePromotion = promotions?.[0];
    const basePrice = Number(app.price);
    const finalPrice = calculateFinalPrice(basePrice, activePromotion);
    const hasDiscount = finalPrice < basePrice;
    const discountPercent = hasDiscount ? Math.round((1 - finalPrice / basePrice) * 100) : 0;
    const isFree = basePrice === 0;
    const reviews = reviewsData?.reviews ?? [];
    const userReview = user ? reviews.find(r => (r.userId ?? r.user?.id) === user.id) : null;

    const handleSubmitReview = async () => {
        if (!app || !reviewComment.trim()) {
            setReviewError("Please write a comment");
            return;
        }
        setReviewError(null);
        try {
            await createReview({
                appId: app.id,
                rating: reviewRating,
                title: reviewTitle.trim() || undefined,
                comment: reviewComment.trim(),
            }).unwrap();
            setReviewTitle("");
            setReviewComment("");
            setReviewRating(5);
        } catch (e: unknown) {
            setReviewError(extractErrorMessage(e, "Failed to submit review"));
        }
    };

    return (
        <div className={style.view} key={app.id}>
            <div className={style.hero}>
                <div className={style.hero__bg} style={{ backgroundImage: `url(${app.iconUrl})` }} aria-hidden />
                <div className={style.hero__veil} aria-hidden />

                <div className={style.hero__content}>
                    <div className={style.hero__icon}>
                        <img src={app.iconUrl} alt={app.name} className={style.hero__img} />
                    </div>

                    <div className={style.hero__info}>
                        <div className={style.hero__nameLine}>
                            <h1 className={style.hero__name}>{app.name}</h1>
                            <span className={`${style.hero__status} ${app.status === "BETA" ? style.hero__status_beta : style.hero__status_release}`}>
                                {app.status === "BETA" ? "Beta" : "Release"}
                            </span>
                            {app.deletedAt && (
                                <span className={`${style.hero__status} ${style.hero__status_removed}`}>
                                    Removed from store
                                </span>
                            )}
                        </div>

                        {app.shortDesc && <p className={style.hero__desc}>{app.shortDesc}</p>}

                        <div className={style.hero__stats}>
                            <div className={style.hero__stat}>
                                <StarRating
                                    rating={app.rating}
                                    size={13}
                                    className={style.hero__stars}
                                    fullClassName={style.hero__starOn}
                                    halfClassName={style.hero__starOn}
                                    emptyClassName={style.hero__starOff}
                                />
                                <span className={style.hero__statVal}>{app.rating.toFixed(1)}</span>
                                <span className={style.hero__statSub}>({app.reviewCount} reviews)</span>
                            </div>
                            <div className={style.hero__statDiv} />
                            <div className={style.hero__stat}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className={style.hero__statVal}>{app.downloadCount.toLocaleString()}</span>
                                <span className={style.hero__statSub}>downloads</span>
                            </div>
                            {app.author && (
                                <>
                                    <div className={style.hero__statDiv} />
                                    <span className={style.hero__statSub}>by <strong className={style.hero__statVal}>{app.author.userName}</strong></span>
                                </>
                            )}
                        </div>

                        <div className={style.hero__chips}>
                            {app.category?.name && <span className={style.chip}>{app.category.name}</span>}
                            {app.platform?.map(p => (
                                <span key={p} className={style.chip}>
                                    <PlatformIcon platform={p} size={11} />
                                    {getPlatformLabel(p)}
                                </span>
                            ))}
                            {app.size > 0 && <span className={style.chip}>{formatSize(app.size)}</span>}
                            {app.versions?.[0] && <span className={style.chip}>v{app.versions[0].version}</span>}
                        </div>

                        {!isFree && (
                            <div className={style.hero__priceArea}>
                                {hasDiscount && (
                                    <div className={style.discountBadge}>
                                        <span className={style.discountPct}>−{discountPercent}%</span>
                                        {activePromotion?.label && (
                                            <span className={style.discountLbl}>{activePromotion.label}</span>
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
                                    <span className={style.newPrice}>${finalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={style.actions}>
                {downloadUrl && (
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className={style.downloadBtn}
                        onClick={() => recordDownload({ id: app.id })}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v12M8 15l4 4 4-4M5 19h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                    </a>
                )}
                {app.sourceUrl && (
                    <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Source Code
                    </a>
                )}
                {app.documentationUrl && (
                    <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer" className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        Docs
                    </a>
                )}
                {app.slug && !app.deletedAt && (
                    <Link href={app.slug ? `/apps/${app.slug}` : '/apps'} className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        View in Store
                    </Link>
                )}
            </div>

            {app.description && (
                <section className={style.block}>
                    <h2 className={style.block__title}>
                        <svg viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M10 9v5M10 7v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        About
                    </h2>
                    <p className={style.block__text}>{app.description}</p>

                    <div className={style.metaGrid}>
                        {app.createdAt && (
                            <div className={style.metaGrid__item}>
                                <span className={style.metaGrid__key}>Released</span>
                                <span className={style.metaGrid__val}>
                                    {new Date(app.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                            </div>
                        )}
                        {app.size > 0 && (
                            <div className={style.metaGrid__item}>
                                <span className={style.metaGrid__key}>Size</span>
                                <span className={style.metaGrid__val}>{formatSize(app.size)}</span>
                            </div>
                        )}
                        {app.minVersion && (
                            <div className={style.metaGrid__item}>
                                <span className={style.metaGrid__key}>Min Version</span>
                                <span className={style.metaGrid__val}>{app.minVersion}</span>
                            </div>
                        )}
                        <div className={style.metaGrid__item}>
                            <span className={style.metaGrid__key}>Downloads</span>
                            <span className={style.metaGrid__val}>{app.downloadCount.toLocaleString()}</span>
                        </div>
                        <div className={style.metaGrid__item}>
                            <span className={style.metaGrid__key}>Rating</span>
                            <span className={style.metaGrid__val}>{app.rating.toFixed(1)} / 5</span>
                        </div>
                    </div>
                </section>
            )}

            {app.screenshots && app.screenshots.length > 0 && (
                <section className={style.block}>
                    <h2 className={style.block__title}>
                        <svg viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="3.5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="7" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M2 14l4-3 3 2.5 3-3.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Screenshots
                        <span className={style.block__badge}>{app.screenshots.length}</span>
                    </h2>
                    <div className={style.shots}>
                        {app.screenshots.map((src, i) => (
                            <button key={i} className={style.shot} onClick={() => openModal(i)} type="button">
                                <img src={src} alt={`${app.name} screenshot ${i + 1}`} className={style.shot__img} />
                                <div className={style.shot__overlay} aria-hidden>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <section className={style.block}>
                <h2 className={style.block__title}>
                    <svg viewBox="0 0 20 20" fill="none">
                        <path d="M18 13a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Reviews
                    <span className={style.block__badge}>{reviews.length}</span>
                </h2>

                {user && !userReview && (
                    <div className={style.reviewForm}>
                        <p className={style.reviewForm__label}>Leave your review</p>
                        <div className={style.reviewForm__stars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`${style.reviewForm__star} ${star <= reviewRating ? style.reviewForm__star_on : ""}`}
                                    onClick={() => setReviewRating(star)}
                                >
                                    <svg viewBox="0 0 24 24" fill={star <= reviewRating ? "currentColor" : "none"}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            ))}
                            <span className={style.reviewForm__ratingNum}>{reviewRating}/5</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={reviewTitle}
                            onChange={e => setReviewTitle(e.target.value)}
                            className={style.reviewForm__input}
                        />
                        <textarea
                            placeholder="Share your experience with this app..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            className={style.reviewForm__textarea}
                            rows={3}
                        />
                        {reviewError && <p className={style.reviewForm__error}>{reviewError}</p>}
                        <button
                            type="button"
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !reviewComment.trim()}
                            className={style.reviewForm__submit}
                        >
                            {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                )}

                {reviews.length > 0 ? (
                    <div className={style.reviewsList}>
                        {reviews.map(review => (
                            <div key={review.id} className={`${style.reviewCard} ${review.userId === user?.id ? style.reviewCard_own : ""}`}>
                                <div className={style.reviewCard__top}>
                                    <div className={style.reviewCard__avatar}>
                                        {review.user?.userName?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <div className={style.reviewCard__meta}>
                                        <span className={style.reviewCard__name}>
                                            {review.user?.userName ?? "Unknown"}
                                            {review.userId === user?.id && <span className={style.reviewCard__you}> (you)</span>}
                                        </span>
                                        <span className={style.reviewCard__date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={style.reviewCard__stars}>
                                        <StarRating
                                            rating={review.rating}
                                            size={12}
                                            fullClassName={style.reviewCard__starOn}
                                            emptyClassName={style.reviewCard__starOff}
                                        />
                                        <span className={style.reviewCard__ratingNum}>{review.rating}/5</span>
                                    </div>
                                </div>
                                {review.title && <h4 className={style.reviewCard__title}>{review.title}</h4>}
                                <p className={style.reviewCard__comment}>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={style.reviewsEmpty}>
                        <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>No reviews yet. Be the first!</p>
                    </div>
                )}
            </section>

            {modalIsOpen && app?.screenshots && (
                <BaseModal isOpen={modalIsOpen} onClose={closeModal} title={app.name} maxWidth={1200}>
                    <div className={style.lb}>
                        <p className={style.lb__counter}>{currentSlide + 1} / {app.screenshots.length}</p>

                        <div className={style.lb__stage}>
                            <button className={style.lb__arrow} onClick={goToPrev} aria-label="Previous">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <div className={style.lb__frame}>
                                <img
                                    key={currentSlide}
                                    src={app.screenshots[currentSlide]}
                                    alt={`Screenshot ${currentSlide + 1}`}
                                    className={style.lb__img}
                                />
                            </div>

                            <button className={style.lb__arrow} onClick={goToNext} aria-label="Next">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        <div className={style.lb__dots}>
                            {app.screenshots.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${style.lb__dot} ${i === currentSlide ? style.lb__dot_on : ""}`}
                                    onClick={() => setCurrentSlide(i)}
                                    aria-label={`Go to screenshot ${i + 1}`}
                                    type="button"
                                />
                            ))}
                        </div>

                        <div className={style.lb__strip}>
                            {app.screenshots.map((src, i) => (
                                <button
                                    key={i}
                                    className={`${style.lb__thumb} ${i === currentSlide ? style.lb__thumb_on : ""}`}
                                    onClick={() => setCurrentSlide(i)}
                                    type="button"
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </BaseModal>
            )}
        </div>
    );
};
