"use client"

import { useQuery } from "@/src/hooks/useQuery";
import { App } from "@/src/types/Entities";
import Link from "next/link";
import { AppCard } from "@/src/components/appCard/AppCard";
import style from "./PopularAppsSection.module.scss";

interface AppsResponse {
  apps: App[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function PopularAppsSection() {
  const { data: appsData, loading: appsLoading } = useQuery<AppsResponse>(
    "/apps?limit=20&sortBy=downloadCount",
    { silent: true }
  );

  const popularApps = appsData?.apps.slice(0, 6) || [];

  return (
    <section className={style.section}>
      <div className={style.section__header}>
        <h2 className={style.section__title}>Popular Apps</h2>
        <Link href="/apps" className={style.section__link}>
          View All →
        </Link>
      </div>
      {appsLoading ? (
        <div className={style.loading}>Loading apps...</div>
      ) : popularApps.length > 0 ? (
        <div className={style.appsGrid}>
          {popularApps.map((app) => (
            <AppCard app={app} key={app.id} />
          ))}
        </div>
      ) : (
        <div className={style.empty}>No apps available yet.</div>
      )}
    </section>
  );
}
