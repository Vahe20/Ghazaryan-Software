"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { setInitialized, setUser } from "@/src/features/slices/authSlice";
import { useGetMeQuery } from "@/src/features/api/authApi";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();
	const isInitialized = useAppSelector((s) => s.auth.isInitialized);
	const hasToken =
		typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
	const { data, isFetching, isSuccess, isError } = useGetMeQuery(undefined, {
		skip: isInitialized || !hasToken,
	});

	useEffect(() => {
		if (!hasToken) {
			dispatch(setUser(null));
			dispatch(setInitialized(true));
			return;
		}
		if (isInitialized || isFetching) return;
		if (isSuccess) dispatch(setUser(data));
		if (isError) dispatch(setUser(null));
		dispatch(setInitialized(true));
	}, [
		data,
		dispatch,
		hasToken,
		isError,
		isFetching,
		isInitialized,
		isSuccess,
	]);

	return <>{children}</>;
}
