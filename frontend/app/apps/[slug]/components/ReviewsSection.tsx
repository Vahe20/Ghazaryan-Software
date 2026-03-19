"use client";

import { StarRating } from "@/src/components/shared/StarRating/StarRating";
import type { Review } from "@/src/types/Entities";
import style from "../page.module.scss";

interface ReviewsSectionProps {
    reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
    return (
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
                                    <span className={style.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
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
    );
}
