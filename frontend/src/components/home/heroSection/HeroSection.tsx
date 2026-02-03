"use client"

import Link from "next/link";
import { useAuthStore } from "@/src/store/authStore";
import style from "./HeroSection.module.scss";

export function HeroSection() {
  const user = useAuthStore(state => state.user);

  return (
    <section className={style.hero}>
      <div className={style.hero__content}>
        <h1 className={style.hero__title}>
          Welcome to{" "}
          <span className={style.hero__titleAccent}>
            Ghazaryan Software
          </span>
        </h1>
        <p className={style.hero__subtitle}>
          Discover amazing applications, tools, and software solutions
          {user && `, ${user.userName}`}
        </p>
        <div className={style.hero__actions}>
          <Link href="/apps" className={style.hero__button}>
            Explore Apps
          </Link>
          {!user && (
            <Link href="/auth" className={style.hero__buttonSecondary}>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
