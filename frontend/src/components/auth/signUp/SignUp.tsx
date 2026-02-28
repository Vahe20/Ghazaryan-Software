"use client"

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/src/app/hooks";
import { useRegisterMutation } from "@/src/features/api/authApi";
import { setInitialized, setUser } from "@/src/features/slices/authSlice";
import { extractErrorMessage } from "@/src/lib/utils";
import { useState } from "react";
import style from "./SignUp.module.scss";

interface SignUpFormData {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export const SignUp = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [registerUser, { isLoading }] = useRegisterMutation();
    const [regError, setRegError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>({
        defaultValues: { userName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false }
    });

    const onSignUp = async (data: SignUpFormData) => {
        try {
            setRegError(null);
            const result = await registerUser({
                userName: data.userName,
                email: data.email,
                password: data.password,
            }).unwrap();
            localStorage.setItem("token", result.accessToken);
            dispatch(setUser(result.user));
            dispatch(setInitialized(true));
            router.push("/");
        } catch (error) {
            setRegError(extractErrorMessage(error, "Failed to create account. Please try again."));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSignUp)} className={style.form}>
            {regError && (
                <div className={style.errorAlert}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.errorIcon}>
                        <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{regError}</span>
                </div>
            )}

            <div className={style.inputGroup}>
                <label htmlFor="signup-username" className={style.label}>Username</label>
                <div className={style.inputWrapper}>
                    <svg className={style.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <input
                        id="signup-username"
                        type="text"
                        className={style.input}
                        placeholder="johndoe"
                        disabled={isLoading}
                        {...register("userName", {
                            required: "Username is required",
                            minLength: { value: 3, message: "Username must be at least 3 characters" },
                            pattern: { value: /^[a-zA-Z0-9_-]+$/, message: "Username can only contain letters, numbers, - and _" }
                        })}
                    />
                </div>
                {errors.userName && <span className={style.error}>{errors.userName.message}</span>}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signup-email" className={style.label}>Email Address</label>
                <div className={style.inputWrapper}>
                    <svg className={style.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        id="signup-email"
                        type="email"
                        className={style.input}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                        })}
                    />
                </div>
                {errors.email && <span className={style.error}>{errors.email.message}</span>}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signup-password" className={style.label}>Password</label>
                <div className={style.inputWrapper}>
                    <svg className={style.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        id="signup-password"
                        type="password"
                        className={style.input}
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...register("password", {
                            required: "Password is required",
                            minLength: { value: 8, message: "Password must be at least 8 characters" },
                            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Password must contain uppercase, lowercase and number" }
                        })}
                    />
                </div>
                {errors.password && <span className={style.error}>{errors.password.message}</span>}
            </div>

            <div className={style.inputGroup}>
                <label htmlFor="signup-confirm" className={style.label}>Confirm Password</label>
                <div className={style.inputWrapper}>
                    <svg className={style.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        id="signup-confirm"
                        type="password"
                        className={style.input}
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) => value === watch("password") || "Passwords do not match"
                        })}
                    />
                </div>
                {errors.confirmPassword && <span className={style.error}>{errors.confirmPassword.message}</span>}
            </div>

            <label className={style.checkboxTerms}>
                <input
                    type="checkbox"
                    disabled={isLoading}
                    {...register("agreeToTerms", { required: "You must agree to the terms and conditions" })}
                />
                <span>
                    I agree to the <a href="/terms">Terms and Conditions</a>
                </span>
            </label>
            {errors.agreeToTerms && <span className={style.error}>{errors.agreeToTerms.message}</span>}

            <button type="submit" className={style.submitBtn} disabled={isLoading}>
                {isLoading ? (
                    <>
                        <svg className={style.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                            <path d="M12 2C6.477 2 2 6.477 2 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Creating Account...
                    </>
                ) : (
                    <>
                        Create Account
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </>
                )}
            </button>

            <div className={style.divider}>
                <span>OR</span>
            </div>

            <button
                type="button"
                className={style.googleBtn}
                onClick={() => {
                    window.location.href = `http://localhost:4000/api/auth/google`;
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </button>
        </form>
    );
};
