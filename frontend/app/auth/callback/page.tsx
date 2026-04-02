"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/src/app/hooks";
import { useLazyGetMeQuery } from "@/src/features/api/authApi";
import { setUser, setInitialized } from "@/src/features/slices/authSlice";
import style from "./page.module.scss";

export default function AuthCallback() {
    return (
        <Suspense fallback={<AuthCallbackLoading />}>
            <AuthCallbackContent />
        </Suspense>
    );
}

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [getMe] = useLazyGetMeQuery();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            console.error("Authentication error:", error);
            router.push(`/auth?error=${error}`);
            return;
        }

        if (token) {
            localStorage.setItem("token", token);
            
            getMe().then((response) => {
                if (response.data) {
                    dispatch(setUser(response.data));
                    dispatch(setInitialized(true));
                }
                router.push("/");
            }).catch(() => {
                router.push("/");
            });
        } else {
            router.push("/auth");
        }
    }, [searchParams, router, dispatch, getMe]);

    return (
        <div className={style.authCallback}>
            <div className={style.loader} />
            <p className={style.text}>Authenticating...</p>
        </div>
    );
}

function AuthCallbackLoading() {
    return <p>Loading...</p>;
}
