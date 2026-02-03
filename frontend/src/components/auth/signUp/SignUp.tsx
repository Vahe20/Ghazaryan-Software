"use client"

import { AuthService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import style from "./SignUp.module.scss";

interface SignUpFormData {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export const SignUp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const fetchUser = useAuthStore(state => state.fetchUser);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>({
        defaultValues: {
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreeToTerms: false
        }
    });

    const onSignUp = async (data: SignUpFormData) => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            await AuthService.register({
                userName: data.userName,
                email: data.email,
                password: data.password
            });

            await AuthService.login({
                email: data.email,
                password: data.password,
            });

            await fetchUser();
            router.push("/");
        } catch (error: any) {
            console.error("Register error:", error);
            setErrorMessage(
                error?.response?.data?.message || 
                error?.message || 
                "Failed to create account. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSignUp)} className={style.form}>
            {errorMessage && (
                <div className={style.errorAlert}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className={style.inputGroup}>
                <label htmlFor="signup-username" className={style.label}>
                    Username
                </label>
                <input
                    id="signup-username"
                    type="text"
                    className={style.input}
                    placeholder="johndoe"
                    disabled={isLoading}
                    {...register("userName", {
                        required: "Username is required",
                        minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters"
                        },
                        pattern: {
                            value: /^[a-zA-Z0-9_-]+$/,
                            message: "Username can only contain letters, numbers, - and _"
                        }
                    })}
                />
                {errors.userName && (
                    <span className={style.error}>
                        {errors.userName.message}
                    </span>
                )}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signup-email" className={style.label}>
                    Email Address
                </label>
                <input
                    id="signup-email"
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
                <label htmlFor="signup-password" className={style.label}>
                    Password
                </label>
                <input
                    id="signup-password"
                    type="password"
                    className={style.input}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: "Password must contain uppercase, lowercase and number"
                        }
                    })}
                />
                {errors.password && (
                    <span className={style.error}>
                        {errors.password.message}
                    </span>
                )}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signup-confirm" className={style.label}>
                    Confirm Password
                </label>
                <input
                    id="signup-confirm"
                    type="password"
                    className={style.input}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                            value === watch("password") || "Passwords do not match"
                    })}
                />
                {errors.confirmPassword && (
                    <span className={style.error}>
                        {errors.confirmPassword.message}
                    </span>
                )}
            </div>

            <label className={style.checkboxTerms}>
                <input
                    type="checkbox"
                    disabled={isLoading}
                    {...register("agreeToTerms", {
                        required: "You must agree to the terms and conditions"
                    })}
                />
                <span>
                    I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
                </span>
            </label>
            {errors.agreeToTerms && (
                <span className={style.error}>
                    {errors.agreeToTerms.message}
                </span>
            )}

            <button type="submit" className={style.submitBtn} disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
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
