import { Axios } from "../config/Axios";
import { Review } from "../types/Entities";

interface CreateReviewData {
    rating: number;
    title?: string;
    comment: string;
}

export const ReviewService = {
    createReview(appId: string, data: CreateReviewData) {
        return Axios.post<Review>(`/apps/${appId}/reviews`, data)
            .then(res => res.data);
    },
};
