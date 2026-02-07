import { CategoryService } from "@/src/services/category.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const categoryKeys = {
	all: ["categories"] as const,

	lists: () => [...categoryKeys.all, "list"] as const,

	details: () => [...categoryKeys.all, "detail"] as const,
	detailById: (id: string) => [...categoryKeys.details(), "id", id] as const,

	detailBySlug: (slug: string) =>
		[...categoryKeys.details(), "slug", slug] as const,
};

export function useCategories() {
	return useQuery({
		queryKey: categoryKeys.lists(),
		queryFn: CategoryService.getAllCategory,
	});
}

export function useCategory(id: string) {
	return useQuery({
		queryKey: categoryKeys.detailById(id),
		queryFn: () => CategoryService.getCategoryById(id),
		enabled: !!id,
	});
}


export function useCategoryBySlug(slug: string) {
	return useQuery({
		queryKey: categoryKeys.detailBySlug(slug),
		queryFn: () => CategoryService.getCategoryBySlug(slug),
		enabled: !!slug,
	});
}


// export function useCreateApp() {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: (newApp: Partial<App>) => AppService.addApp(newApp),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
// 		},
// 	});
// }

// export function useUpdateApp() {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: ({ id, updates }: { id: string; updates: Partial<App> }) =>
// 			AppService.updateApp(id, updates),
// 		onSuccess: (_, variables) => {
// 			queryClient.invalidateQueries({
// 				queryKey: categoryKeys.detail(variables.id),
// 			});
// 			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
// 		},
// 	});
// }

// export function useDeleteApp() {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: (id: string) => AppService.deleteApp(id),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
// 		},
// 	});
// }
