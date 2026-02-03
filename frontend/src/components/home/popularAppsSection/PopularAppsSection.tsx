"use client"

import Link from "next/link";
import { useApps } from "@/src/hooks/queries/useApps";
import { AppCard } from "@/src/components/appCard/AppCard";
import style from "./PopularAppsSection.module.scss";

export function PopularAppsSection() {
  const { data, isLoading } = useApps({ limit: 6, sortBy: "downloadCount" });

  const popularApps = data?.apps.slice(0, 6) || [];

  return (
    <section className={style.section}>
      <div className={style.section__header}>
        <h2 className={style.section__title}>Popular Apps</h2>
        <Link href="/apps" className={style.section__link}>
          View All →
        </Link>
      </div>
      {isLoading ? (
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
