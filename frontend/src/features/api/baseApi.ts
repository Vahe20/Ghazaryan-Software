import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";

const apiBaseUrl = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");

const rawBaseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

const buildRateLimitError = (
    meta: FetchBaseQueryMeta | undefined,
    data: unknown,
): FetchBaseQueryError => {
    const resetTime = meta?.response?.headers?.get("ratelimit-reset") ?? null;
    const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000) : null;
    const message = resetDate
        ? `Too many requests. Please try again at ${resetDate.toLocaleTimeString()}`
        : "Too many requests. Please try again later.";
    const baseData = data && typeof data === "object" && !Array.isArray(data) ? data : {};
    return {
        status: 429,
        data: { ...baseData, isRateLimitError: true, message, resetTime },
    };
};

const extractErrorMessage = (data: unknown): string | null => {
    if (!data || typeof data !== "object") return null;

    const payload = data as Record<string, unknown>;
    if (typeof payload.message === "string" && payload.message.trim()) return payload.message;

    const nestedError = payload.error;
    if (nestedError && typeof nestedError === "object") {
        const nestedPayload = nestedError as Record<string, unknown>;
        if (typeof nestedPayload.message === "string" && nestedPayload.message.trim()) {
            return nestedPayload.message;
        }
    }

    if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
    return null;
};

const normalizeErrorData = (data: unknown): unknown => {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data;

    const message = extractErrorMessage(data);
    if (!message) return data;

    const payload = data as Record<string, unknown>;
    return {
        ...payload,
        message,
    };
};

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
    async (args, api, extraOptions) => {
        if (typeof args === "object" && args.body instanceof FormData) {
            const { url, method, body } = args;
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const headers = new Headers();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            const response = await fetch(`${apiBaseUrl}/${url.replace(/^\//, "")}`, {
                method: method ?? "POST",
                headers,
                body,
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                if (response.status === 429) {
                    return {
                        error: buildRateLimitError(
                            { response, request: new Request(`${apiBaseUrl}/${typeof args === "string" ? args : args.url}`) },
                            normalizeErrorData(data),
                        ),
                    };
                }
                return {
                    error: {
                        status: response.status,
                        data: normalizeErrorData(data),
                    } as FetchBaseQueryError,
                };
            }
            return { data };
        }
        const result = await rawBaseQuery(args, api, extraOptions);
        if (result.error && result.error.status === 429) {
            return {
                error: buildRateLimitError(
                    result.meta as FetchBaseQueryMeta | undefined,
                    normalizeErrorData(result.error.data),
                ),
            };
        }
        if (result.error) {
            return {
                error: {
                    ...result.error,
                    data: normalizeErrorData(result.error.data),
                },
            };
        }
        return result;
    };

export const api = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: [
        "Apps",
        "Categories",
        "News",
        "Users",
        "Purchases",
        "Reviews",
        "Versions",
        "Editions",
        "Promotions",
        "DeveloperRequests",
    ],
    endpoints: () => ({}),
});
