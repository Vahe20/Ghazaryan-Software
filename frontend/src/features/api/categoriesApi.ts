import { api } from "./baseApi";
import { Category } from "@/src/types/Entities";

export const categoriesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getCategories: builder.query<Category[], void>({
			query: () => "/categories",
			providesTags: [{ type: "Categories", id: "LIST" }],
		}),

		getCategoryById: builder.query<Category, string>({
			query: (id) => `/categories/${id}`,
			providesTags: (_, __, id) => [{ type: "Categories", id }],
		}),

		createCategory: builder.mutation<
			Category,
			{ name: string; description?: string; order?: number }
		>({
			query: (data) => ({
				url: "/categories",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "Categories", id: "LIST" }],
		}),

		updateCategory: builder.mutation<
			Category,
			{ id: string; data: { name?: string; description?: string; order?: number } }
		>({
			query: ({ id, data }) => ({
				url: `/categories/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_, __, { id }) => [
				{ type: "Categories", id },
				{ type: "Categories", id: "LIST" },
			],
		}),

		deleteCategory: builder.mutation<void, string>({
			query: (id) => ({
				url: `/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: [{ type: "Categories", id: "LIST" }],
		}),
	}),
});

export const {
	useGetCategoriesQuery,
	useGetCategoryByIdQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
} = categoriesApi;
