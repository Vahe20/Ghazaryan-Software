import { Axios } from "../config/Axios";

export const CategoryService = {
	getAllCategory: () => {
		return Axios.get("/categories").then(res => res.data);
	},

	getCategoryById: (id: string) => {
		return Axios.get(`/categories/${id}`).then(res => res.data);
	},

    getCategoryBySlug: (slug: string) => {
		return Axios.get(`/categories/slug/${slug}`).then(res => res.data);
	},
};
