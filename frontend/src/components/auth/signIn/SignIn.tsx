"use client"

import { AuthService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import style from "./SignIn.module.scss";

interface SignInFormData {
    email: string;
    password: string;
}

export const SignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const fetchUser = useAuthStore(state => state.fetchUser);

    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSignIn = async (data: SignInFormData) => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            await AuthService.login({
                email: data.email,
                password: data.password,
            });

            await fetchUser();
            router.replace("/");
        } catch (error: any) {
            console.error("Login error:", error);
            setErrorMessage(
                error?.response?.data?.message || 
                error?.message || 
                "Failed to sign in. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSignIn)} className={style.form}>
            {errorMessage && (
                <div className={style.errorAlert}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className={style.inputGroup}>
                <label htmlFor="signin-email" className={style.label}>
                    Email Address
                </label>
                <input
                    id="signin-email"
                    type="email"
                    className={style.input}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    })}
                />
                {errors.email && (
                    <span className={style.error}>
                        {errors.email.message}
                    </span>
                )}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signin-password" className={style.label}>
                    Password
                </label>
                <input
                    id="signin-password"
                    type="password"
                    className={style.input}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters"
                        }
                    })}
                />
                {errors.password && (
                    <span className={style.error}>
                        {errors.password.message}
                    </span>
                )}
            </div>

            <div className={style.options}>
                <a href="#" className={style.forgotLink}>
                    Forgot password?
                </a>
            </div>

            <button type="submit" className={style.submitBtn} disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M4 10H16M16 10L11 5M16 10L11 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>
        </form>
    );
};
