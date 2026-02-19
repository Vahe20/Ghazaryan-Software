import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppService, GetAppsParams } from "@/src/services/app.service";
import { App } from "@/src/types/Entities";

export const appsKeys = {
  all: ["apps"] as const,
  lists: () => [...appsKeys.all, "list"] as const,
  list: (params: GetAppsParams) => [...appsKeys.lists(), params] as const,
  details: () => [...appsKeys.all, "detail"] as const,
  detail: (id: string) => [...appsKeys.details(), id] as const,
  library: () => [...appsKeys.all, "library"] as const,
};

export function useApps(params: GetAppsParams = {}) {
  return useQuery({
    queryKey: appsKeys.list(params),
    queryFn: () => AppService.getApps(params),
  });
}

export function useApp(id: string) {
  return useQuery({
    queryKey: appsKeys.detail(id),
    queryFn: () => AppService.getAppById(id),
    enabled: !!id,
  });
}

export function useAppBySlug(slug: string) {
  return useQuery({
    queryKey: [...appsKeys.detail(slug), "slug"],
    queryFn: () => AppService.getAppBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newApp: Partial<App>) => AppService.addApp(newApp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appsKeys.lists() });
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<App> }) =>
      AppService.updateApp(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appsKeys.lists() });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AppService.deleteApp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appsKeys.lists() });
    },
  });
}

export function useUserLibrary() {
  return useQuery({
    queryKey: appsKeys.library(),
    queryFn: () => AppService.getUserLibrary(),
  });
}