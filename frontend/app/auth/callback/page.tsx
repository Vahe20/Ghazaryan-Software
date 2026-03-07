"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/src/app/hooks";
import { useLazyGetMeQuery } from "@/src/features/api/authApi";
import { setUser, setInitialized } from "@/src/features/slices/authSlice";

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
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "100vh",
                flexDirection: "column",
                gap: "1rem"
            }}>
                <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3498db",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
                <p>Authenticating...</p>
            </div>
        </>
    );
}

function AuthCallbackLoading() {
    return <p>Loading...</p>;
}
