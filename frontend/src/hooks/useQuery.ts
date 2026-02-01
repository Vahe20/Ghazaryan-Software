import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Axios } from "../config/Axios";

interface UseQueryOptions {
	auto?: boolean;
	silent?: boolean;
}

export const useQuery = <T>(url: string, options: UseQueryOptions = {}) => {
	const { auto = true } = options;

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<AxiosError | null>(null);

	const abortRef = useRef<AbortController | null>(null);

	const fetchData = useCallback(
		async (opts: { silent?: boolean } = {}) => {
			const { silent = false } = opts;

			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			try {
				if (!silent) setLoading(true);
				setError(null);

				const response = await Axios.get<T>(url, {
					signal: controller.signal,
				});

				console.log(response);

				setData(response.data);
			} catch (err) {
				if (axios.isCancel(err)) return;
				if (axios.isAxiosError(err)) {
					setError(err);
				}
			} finally {
				if (!silent) setLoading(false);
			}
		},
		[url],
	);

	useEffect(() => {
		if (auto) fetchData();
		return () => abortRef.current?.abort();
	}, [auto, fetchData]);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
	};
};
