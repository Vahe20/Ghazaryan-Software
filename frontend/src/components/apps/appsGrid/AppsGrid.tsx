"use client"

import { App } from "@/src/types/Entities";
import { AppCard } from "@/src/components/shared/appCard/AppCard";
import style from "./AppsGrid.module.scss";

interface AppsGridProps {
  apps: App[];
  loading: boolean;
  error: string | null;
}

const SKELETON_COUNT = 8;

export function AppsGrid({ apps, loading, error }: AppsGridProps) {
  if (loading) {
    return (
      <div className={style.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className={style.skeletonCard} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={style.skeletonImage} />
            <div className={style.skeletonContent}>
              <div className={style.skeletonHeader}>
                <div className={style.skeletonIcon} />
                <div className={style.skeletonInfo}>
                  <div className={`${style.skeletonLine} ${style.skeletonTitle}`} />
                  <div className={`${style.skeletonLine} ${style.skeletonCategory}`} />
                </div>
              </div>
              <div className={`${style.skeletonLine} ${style.skeletonDesc}`} />
              <div className={`${style.skeletonLine} ${style.skeletonDescShort}`} />
              <div className={style.skeletonStats}>
                <div className={`${style.skeletonLine} ${style.skeletonStat}`} />
                <div className={`${style.skeletonLine} ${style.skeletonStat}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.error}>
        <div className={style.errorIcon}>
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M24 14V24M24 34H24.02M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Failed to Load Apps</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={style.retryButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className={style.empty}>
        <div className={style.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="3"/>
            <path d="M42 42L56 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M22 28H34M28 22V34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h3>No Applications Found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={style.grid}>
      {apps.map((app, i) => (
        <div key={app.id} className={style.cardWrapper} style={{ animationDelay: `${i * 0.05}s` }}>
          <AppCard app={app} />
        </div>
      ))}
    </div>
  );
}
