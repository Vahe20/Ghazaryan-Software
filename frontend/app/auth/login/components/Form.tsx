"use client";

import Link from "next/link";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import style from "../style.module.scss";
import { AuthService } from "@/src/services/auth.service";


interface FormData {
    email: string;
    password: string;
}


export const Form = () => {
    const { register, handleSubmit } = useForm<FormData>();

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isLoading, setIsLoading] = useState(false);

    const Login: SubmitHandler<FormData> = async (form) => {
        setIsLoading(true);
        setErrors({});

        try {
            const response = await AuthService.login(form);
            localStorage.setItem("token", response.data.accessToken);
        } catch {
            setErrors({ email: "Registration failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <form className={style.form} onSubmit={handleSubmit(Login)}>
            <div className={style.form__item}>
                <label>Email</label>
                <input
                    {...register("email")}
                    type="text"
                    onChange={() => setErrors({})}
                    placeholder="Enter your email"
                    disabled={isLoading}
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>


            <div className={style.form__item}>
                <label>Password</label>
                <input
                    {...register("password")}
                    type="password"
                    onChange={() => setErrors({})}
                    placeholder="Enter your password"
                    disabled={isLoading}
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className={style.form__submit}>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "sign ing..." : "login to your Account"}
                </button>
            </div>

            <div className={style.form__footer}>
                No have a account? <Link href="/auth/register">Sign Up</Link>
            </div>
        </form>
    );
};
