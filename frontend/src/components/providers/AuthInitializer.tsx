"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { setInitialized, setUser } from "@/src/features/slices/authSlice";
import { useGetMeQuery } from "@/src/features/api/authApi";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();
	const isInitialized = useAppSelector((s) => s.auth.isInitialized);
	const { data, isSuccess, isError, isFetching } = useGetMeQuery(undefined, {
		skip: isInitialized,
	});

	useEffect(() => {
		if (isInitialized || isFetching) return;

		if (isSuccess && data) {
			dispatch(setUser(data));
		} else if (isError) {
			dispatch(setUser(null));
		}

		dispatch(setInitialized(true));
	}, [
		data,
		dispatch,
		isError,
		isFetching,
		isInitialized,
		isSuccess,
	]);

	return <>{children}</>;
}
