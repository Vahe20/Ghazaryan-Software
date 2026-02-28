"use client"

import Link from "next/link";
import { useAuthStore } from "@/src/store/AuthStore";
import style from "./HeroSection.module.scss";

export function HeroSection() {
  const user = useAuthStore(state => state.user);

  return (
    <section className={style.hero}>
      {}
      <div className={style.orb1} />
      <div className={style.orb2} />
      <div className={style.orb3} />

      {}
      <div className={style.particles} aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={style.particle} style={{
            left: `${8 + (i * 7.5) % 86}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3.5 + (i % 4) * 0.8}s`,
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
          }} />
        ))}
      </div>

      {}
      <div className={style.gridPattern} aria-hidden />

      <div className={style.hero__content}>
        <div className={style.hero__badge}>
          <span className={style.hero__badgeDot} />
          Software Marketplace
        </div>

        <h1 className={style.hero__title}>
          <span className={style.hero__titleLine1}>Welcome to</span>{" "}
          <span className={style.hero__titleAccent}>
            Ghazaryan
          </span>
          <span className={style.hero__titleLine2}> Software</span>
        </h1>
        <p className={style.hero__subtitle}>
          Discover amazing applications, tools, and software solutions
          {user && (
            <span className={style.hero__userName}>, {user.userName}</span>
          )}
        </p>
        <div className={style.hero__actions}>
          <Link href="/apps" className={style.hero__button}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9L5 21V3z" fill="currentColor"/>
            </svg>
            Explore Apps
          </Link>
          {!user && (
            <Link href="/auth" className={style.hero__buttonSecondary}>
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>

        <div className={style.hero__stats}>
          <div className={style.hero__stat}>
            <span className={style.hero__statNum}>500+</span>
            <span className={style.hero__statLabel}>Apps</span>
          </div>
          <div className={style.hero__statDivider} />
          <div className={style.hero__stat}>
            <span className={style.hero__statNum}>50K+</span>
            <span className={style.hero__statLabel}>Downloads</span>
          </div>
          <div className={style.hero__statDivider} />
          <div className={style.hero__stat}>
            <span className={style.hero__statNum}>10K+</span>
            <span className={style.hero__statLabel}>Users</span>
          </div>
        </div>
      </div>
    </section>
  );
}
