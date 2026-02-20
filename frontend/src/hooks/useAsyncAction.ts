"use client";

import { useState, useCallback } from "react";
import { extractErrorMessage } from "@/src/lib/utils";

interface AsyncState<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
}

interface UseAsyncActionReturn<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
    run: (fn: () => Promise<T>) => Promise<T | undefined>;
    clearError: () => void;
}

export function useAsyncAction<T = void>(fallbackMessage = "An error occurred"): UseAsyncActionReturn<T> {
    const [state, setState] = useState<AsyncState<T>>({ loading: false, error: null, data: null });

    const run = useCallback(async (fn: () => Promise<T>) => {
        setState({ loading: true, error: null, data: null });
        try {
            const result = await fn();
            setState({ loading: false, error: null, data: result });
            return result;
        } catch (err) {
            setState({ loading: false, error: extractErrorMessage(err, fallbackMessage), data: null });
        }
    }, [fallbackMessage]);

    const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

    return { ...state, run, clearError };
}
