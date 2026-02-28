"use client"

import { useState } from "react";
import style from "./AuthPage.module.scss";
import { SignIn } from "../signIn/SignIn";
import { SignUp } from "../signUp/SignUp";

export const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
    };

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

                    {isSignUp ? <SignUp /> : <SignIn />}

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
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};