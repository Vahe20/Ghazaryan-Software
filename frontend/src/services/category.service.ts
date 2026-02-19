import { Axios } from "../config/Axios";
import { Category } from "../types/Entities";

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

	addCategory: (newCategory: Partial<Category>) => {
		return Axios.post("/categories", newCategory).then(res => res.data);
	},

	updateCategory: (id: string, updates: Partial<Category>) => {
		return Axios.put(`/categories/${id}`, updates).then(res => res.data);
	},
	
	deleteCategory: (id: string) => {
		return Axios.delete(`/categories/${id}`).then(res => res.data);
	},
};
