import { api } from "./baseApi";
import { NewsItem } from "@/src/types/Entities";

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export const newsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getNews: builder.query<
			{ news: NewsItem[]; pagination: Pagination },
			{ page?: number; limit?: number } | void
		>({
			query: (params = {}) => ({ url: "/news", params: params || {} }),
			providesTags: [{ type: "News", id: "LIST" }],
		}),

		getNewsById: builder.query<NewsItem, string>({
			query: (id) => `/news/${id}`,
			providesTags: (_, __, id) => [{ type: "News", id }],
		}),

		createNews: builder.mutation<
			NewsItem,
			Omit<NewsItem, "id" | "createdAt" | "updatedAt">
		>({
			query: (data) => ({ url: "/news", method: "POST", body: data }),
			invalidatesTags: [{ type: "News", id: "LIST" }],
		}),

		updateNews: builder.mutation<
			NewsItem,
			{
				id: string;
				data: Partial<Omit<NewsItem, "id" | "createdAt" | "updatedAt">>;
			}
		>({
			query: ({ id, data }) => ({
				url: `/news/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_, __, { id }) => [
				{ type: "News", id },
				{ type: "News", id: "LIST" },
			],
		}),

		deleteNews: builder.mutation<void, string>({
			query: (id) => ({ url: `/news/${id}`, method: "DELETE" }),
			invalidatesTags: [{ type: "News", id: "LIST" }],
		}),
	}),
});

export const {
	useGetNewsQuery,
	useGetNewsByIdQuery,
	useCreateNewsMutation,
	useUpdateNewsMutation,
	useDeleteNewsMutation,
} = newsApi;
