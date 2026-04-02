import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";


const apiBaseUrl = (
    process.env.BACKEND_URL ?? ""
).replace(/\/$/, "");


const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
};


const setAccessToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
};


const clearAccessToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
};


const rawBaseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
    credentials: "include",
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
        data: {
            ...baseData,
            isRateLimitError: true,
            message,
            resetTime,
        },
    };
};


const extractErrorMessage = (data: unknown): string | null => {
    if (!data || typeof data !== "object") return null;
    const payload = data as Record<string, unknown>;
    if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
    }
    const nestedError = payload.error;
    if (nestedError && typeof nestedError === "object") {
        const nestedPayload = nestedError as Record<string, unknown>;
        if (typeof nestedPayload.message === "string" && nestedPayload.message.trim()) {
            return nestedPayload.message;
        }
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
    }
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


const toFetchBaseQueryError = (error: {
    status: number | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";
    data?: unknown;
    error?: string;
}): FetchBaseQueryError => {
    if (typeof error.status === "number") {
        return {
            status: error.status,
            data: normalizeErrorData(error.data),
        };
    }
    if (error.status === "CUSTOM_ERROR") {
        return {
            status: "CUSTOM_ERROR",
            error: error.error ?? "Unknown error",
            data: normalizeErrorData(error.data),
        };
    }
    return {
        status: "CUSTOM_ERROR",
        error: error.error ?? "Network error",
        data: normalizeErrorData(error.data),
    };
};


const isRefreshRequest = (args: string | FetchArgs): boolean => {
    const url = typeof args === "string" ? args : args.url;
    return /\/auth\/refresh$/i.test(url);
};

const tryRefreshAccessToken = async (
    api: Parameters<BaseQueryFn>[1],
    extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> => {
    const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
    );
    if (refreshResult.data && typeof refreshResult.data === "object") {
        const token = (refreshResult.data as { accessToken?: unknown }).accessToken;
        if (typeof token === "string" && token.length > 0) {
            setAccessToken(token);
            return true;
        }
    }
    clearAccessToken();
    return false;
};


const executeFormDataRequest = async (args: FetchArgs) => {
    const { url, method, body } = args;
    const token = getAccessToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const requestUrl = `${apiBaseUrl}/${url.replace(/^\//, "")}`;
    const response = await fetch(requestUrl, {
        method: method ?? "POST",
        headers,
        credentials: "include",
        body: body as FormData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const errorObj = {
            status: response.status,
            data: normalizeErrorData(data),
        } as FetchBaseQueryError;
        return {
            error: errorObj,
            meta: {
                response,
                request: new Request(requestUrl, { credentials: "include" }),
            },
        };
    }
    return {
        data,
        meta: { response },
    };
};
;


const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    const executeRequest = async () => {
        if (typeof args === "object" && args.body instanceof FormData) {
            return executeFormDataRequest(args);
        }
        return rawBaseQuery(args, api, extraOptions);
    };
    let result = await executeRequest();
    if (result.error && result.error.status === 401 && !isRefreshRequest(args)) {
        const refreshed = await tryRefreshAccessToken(api, extraOptions);
        if (refreshed) {
            result = await executeRequest();
        }
    }
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
            error: toFetchBaseQueryError(result.error),
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