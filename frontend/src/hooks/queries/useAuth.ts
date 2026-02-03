import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/src/services/auth.service";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        
        const response = await AuthService.me();
        return response;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
