import React, { useId } from "react";

interface StarRatingProps {
    rating: number;
    size?: number;
    className?: string;
    fullClassName?: string;
    halfClassName?: string;
    emptyClassName?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    size = 12,
    className,
    fullClassName,
    halfClassName,
    emptyClassName,
}) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const gradientId = `star-half-${useId().replace(/:/g, "")}`;

    return (
        <span className={className}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isFull = star <= full;
                const isHalf = star === full + 1 && half;
                const fill = isFull ? "currentColor" : isHalf ? `url(#${gradientId})` : "none";
                const starClassName = isFull ? fullClassName : isHalf ? halfClassName : emptyClassName;

                return (
                    <svg
                        key={star}
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={fill}
                        className={starClassName}
                    >
                        {isHalf && (
                            <defs>
                                <linearGradient id={gradientId}>
                                    <stop offset="50%" stopColor="currentColor" />
                                    <stop offset="50%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        )}
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            })}
        </span>
    );
};
