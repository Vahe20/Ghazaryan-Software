"use client"

import { App } from "@/src/types/Entities";
import { AppCard } from "@/src/components/appCard/AppCard";
import style from "./AppsGrid.module.scss";

interface AppsGridProps {
  apps: App[];
  loading: boolean;
  error: string | null;
}

export function AppsGrid({ apps, loading, error }: AppsGridProps) {
  if (loading) {
    return (
      <div className={style.loading}>
        <div className={style.spinner}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.error}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 14V24M24 34H24.02M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Failed to Load Apps</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={style.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className={style.empty}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M32 8V24M32 40V56M52 32H36M20 32H4M45.2548 45.2548L34.8284 34.8284M29.1716 29.1716L18.7452 18.7452M45.2548 18.7452L34.8284 29.1716M29.1716 34.8284L18.7452 45.2548" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <h3>No Applications Found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={style.grid}>
      {apps.map((app) => (
        <AppCard app={app} key={app.id} />
      ))}
    </div>
  );
}
