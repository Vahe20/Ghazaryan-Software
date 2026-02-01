'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { AuthService } from "@/src/services/auth.service"
import { useAuthStore } from "@/src/store/authStore"
import style from "./style.module.scss"

interface SignInFormData {
    email: string
    password: string
    rememberMe?: boolean
}

interface SignUpFormData {
    userName: string
    email: string
    password: string
    confirmPassword: string
    agreeToTerms: boolean
}

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const fetchUser = useAuthStore(state => state.fetchUser)

    const signInForm = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false
        }
    })

    const signUpForm = useForm<SignUpFormData>({
        defaultValues: {
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreeToTerms: false
        }
    })

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setErrorMessage(null)
        signInForm.reset()
        signUpForm.reset()
    }

    const onSignIn = async (data: SignInFormData) => {
        try {
            setIsLoading(true)
            setErrorMessage(null)

            await AuthService.login({
                email: data.email,
                password: data.password,
                rememberMe: data.rememberMe
            })

            await fetchUser()

            router.push("/")
        } catch (error) {
            console.error("Login error:", error)
            // setErrorMessage(
            //     error.response?.data?.error || 
            //     error.message || 
            //     "Failed to sign in. Please try again."
            // )
        } finally {
            setIsLoading(false)
        }
    }

    const onSignUp = async (data: SignUpFormData) => {
        try {
            setIsLoading(true)
            setErrorMessage(null)

            await AuthService.register({
                userName: data.userName,
                email: data.email,
                password: data.password
            })

            await AuthService.login({
                email: data.email,
                password: data.password,
                rememberMe: true
            })

            await fetchUser()

            router.push("/")
        } catch (error) {
            console.error("Register error:", error)
            // setErrorMessage(
            //     error.response?.data?.error || 
            //     error.message || 
            //     "Failed to create account. Please try again."
            // )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={style.authPage}>
            <div className={style.authContainer}>
                <div className={style.authCard}>
                    <div className={style.cardHeader}>
                        <h1 className={style.logo}>
                            Ghazaryan <span className={style.logoAccent}>Software</span>
                        </h1>
                        <h2 className={style.title}>
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className={style.subtitle}>
                            {isSignUp
                                ? "Join us and discover amazing applications"
                                : "Sign in to access your account and apps"
                            }
                        </p>
                    </div>

                    {errorMessage && (
                        <div className={style.errorAlert}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {!isSignUp ? (
                        <form onSubmit={signInForm.handleSubmit(onSignIn)} className={style.form}>
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
                                    {...signInForm.register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {signInForm.formState.errors.email && (
                                    <span className={style.error}>
                                        {signInForm.formState.errors.email.message}
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
                                    {...signInForm.register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                />
                                {signInForm.formState.errors.password && (
                                    <span className={style.error}>
                                        {signInForm.formState.errors.password.message}
                                    </span>
                                )}
                            </div>

                            <div className={style.options}>
                                <label className={style.checkbox}>
                                    <input
                                        type="checkbox"
                                        disabled={isLoading}
                                        {...signInForm.register("rememberMe")}
                                    />
                                    <span>Remember me for 30 days</span>
                                </label>
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
                    ) : (
                        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className={style.form}>
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
                                    {...signUpForm.register("userName", {
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
                                {signUpForm.formState.errors.userName && (
                                    <span className={style.error}>
                                        {signUpForm.formState.errors.userName.message}
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
                                    {...signUpForm.register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {signUpForm.formState.errors.email && (
                                    <span className={style.error}>
                                        {signUpForm.formState.errors.email.message}
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
                                    {...signUpForm.register("password", {
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
                                {signUpForm.formState.errors.password && (
                                    <span className={style.error}>
                                        {signUpForm.formState.errors.password.message}
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
                                    {...signUpForm.register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) =>
                                            value === signUpForm.watch("password") || "Passwords do not match"
                                    })}
                                />
                                {signUpForm.formState.errors.confirmPassword && (
                                    <span className={style.error}>
                                        {signUpForm.formState.errors.confirmPassword.message}
                                    </span>
                                )}
                            </div>

                            <label className={style.checkboxTerms}>
                                <input
                                    type="checkbox"
                                    disabled={isLoading}
                                    {...signUpForm.register("agreeToTerms", {
                                        required: "You must agree to the terms and conditions"
                                    })}
                                />
                                <span>
                                    I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
                                </span>
                            </label>
                            {signUpForm.formState.errors.agreeToTerms && (
                                <span className={style.error}>
                                    {signUpForm.formState.errors.agreeToTerms.message}
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
                    )}

                    <div className={style.divider}>
                        <span>or continue with</span>
                    </div>

                    <div className={style.socialButtons}>
                        <button type="button" className={style.socialBtn} disabled={isLoading}>
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4" />
                                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853" />
                                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05" />
                                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button type="button" className={style.socialBtn} disabled={isLoading}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <div className={style.switchMode}>
                        <p>
                            {isSignUp
                                ? "Already have an account?"
                                : "Don't have an account?"
                            }
                            <button
                                type="button"
                                onClick={toggleMode}
                                className={style.switchBtn}
                                disabled={isLoading}
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
