"use client";

import { useState } from "react";
import Link from "next/link";
import style from "../style.module.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import { Axios } from "@/src/config/Axios";
import { AuthService } from "@/src/services/auth.service";

interface FormData {
    userName: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export const Form = () => {
    const { register, handleSubmit } = useForm<FormData>();

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isLoading, setIsLoading] = useState(false);


    const Register: SubmitHandler<FormData> = async (form) => {
        if (form.password !== form.confirmPassword) {
            setErrors({ confirmPassword: "password !== confirmPassword" });
            return;
        }
        setIsLoading(true);
        setErrors({});

        try {
            delete form.confirmPassword
            const data = AuthService.register(form);
            console.log(data);
        } catch {
            setErrors({ userName: "Registration failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={style.form} onSubmit={handleSubmit(Register)}>
            <div className={style.form__item}>
                <label>Username</label>
                <input
                    {...register("userName", {
                        required: "UserName is required"
                    })}
                    type="text"
                    onChange={() => setErrors({})}
                    placeholder="Enter your username"
                    disabled={isLoading}
                />
                {errors.userName && <span className="error">{errors.userName}</span>}
            </div>

            <div className={style.form__item}>
                <label>Full Name</label>
                <input
                    {...register("fullName", {
                        required: "Name is required",
                        minLength: {
                            value: 3,
                            message: "Name must be at least 2 characters"
                        }
                    })}
                    type="text"
                    onChange={() => setErrors({})}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
            </div>

            <div className={style.form__item}>
                <label>Email</label>
                <input
                    {...register("email", {
                        required: "Email is required"
                    })}
                    type="email"
                    onChange={() => setErrors({})}
                    placeholder="Enter your Email"
                    disabled={isLoading}
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className={style.form__item}>
                <label>Password</label>
                <input
                    {...register("password", {
                        required: "password is required",
                        minLength: {
                            value: 8,
                            message: "password must be at least 8 characters"
                        }
                    })}
                    type="password"
                    onChange={() => setErrors({})}
                    placeholder="Enter your password"
                    disabled={isLoading}
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className={style.form__item}>
                <label>Confirm Password</label>
                <input
                    {...register("confirmPassword")}
                    type="password"
                    onChange={() => setErrors({})}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div className={style.form__submit}>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                </button>
            </div>

            <div className={style.form__footer}>
                Already have an account? <Link href="/auth/login">Sign In</Link>
            </div>
        </form>
    );
};
