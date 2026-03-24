import { api } from "./baseApi";
import type { User } from "@/src/types/Entities";

interface AuthResponse {
    user: User;
    accessToken: string;
}

interface RegisterResponse {
    id: string;
    email: string;
    username: string;
}

interface MessageResponse {
    message: string;
}

interface AvatarResponse {
    id: string;
    avatarUrl: string;
}

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<User, void>({
            query: () => "/auth/me",
        }),

        login: builder.mutation<AuthResponse, { email: string; password: string }>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        register: builder.mutation<RegisterResponse, { userName: string; email: string; password: string }>({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
        }),

        refreshToken: builder.mutation<{ accessToken: string }, void>({
            query: () => ({ url: "/auth/refresh", method: "POST" }),
        }),

        logout: builder.mutation<MessageResponse, void>({
            query: () => ({ url: "/auth/logout", method: "POST" }),
        }),

        changePassword: builder.mutation<MessageResponse, { currentPassword: string; newPassword: string }>({
            query: (data) => ({
                url: "/auth/password",
                method: "PATCH",
                body: data,
            }),
        }),

        changeAvatar: builder.mutation<AvatarResponse, FormData>({
            query: (formData) => ({
                url: "/auth/avatar",
                method: "PATCH",
                body: formData,
            }),
        }),

        deleteAccount: builder.mutation<MessageResponse, { password: string }>({
            query: (data) => ({
                url: "/auth/account",
                method: "DELETE",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetMeQuery,
    useLazyGetMeQuery,
    useLoginMutation,
    useRegisterMutation,
    useChangePasswordMutation,
    useChangeAvatarMutation,
    useDeleteAccountMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
} = authApi;
