import { api } from "./baseApi";
import { User } from "@/src/types/Entities";

interface AuthResponse {
	user: User;
	accessToken: string;
}

interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

interface MessageResponse {
	message: string;
}

export const authApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getMe: builder.query<User, void>({
			query: () => "/auth/me",
		}),

		login: builder.mutation<
			AuthResponse,
			{ email: string; password: string }
		>({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				body: credentials,
			}),
		}),

		register: builder.mutation<
			AuthResponse,
			{ userName: string; email: string; password: string }
		>({
			query: (data) => ({
				url: "/auth/register",
				method: "POST",
				body: data,
			}),
		}),

		changePassword: builder.mutation<MessageResponse, ChangePasswordRequest>({
			query: (data) => ({
				url: "/auth/password",
				method: "PATCH",
				body: data,
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
	useDeleteAccountMutation,
} = authApi;
