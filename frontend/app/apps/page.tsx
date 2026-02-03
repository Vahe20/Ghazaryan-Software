"use client"

import { useState } from "react";
import { useApps } from "@/src/hooks/queries/useApps";
import { AppsFilters } from "@/src/components/apps/appsFilters/AppsFilters";
import { AppsGrid } from "@/src/components/apps/appsGrid/AppsGrid";
import { AppsPagination } from "@/src/components/apps/appsPagination/AppsPagination";
import style from "./page.module.scss";

export default function AppsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "downloadCount" | "createdAt">("downloadCount");

  const { data, isLoading, error } = useApps({
    page,
    limit: 20,
    search: searchQuery,
    sortBy,
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleSortChange = (sort: "name" | "downloadCount" | "createdAt") => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div className={style.appsPage}>
      <div className={style.header}>
        <h1 className={style.title}>
          Discover <span className={style.titleAccent}>Applications</span>
        </h1>
        <p className={style.subtitle}>
          Browse our collection of {data?.pagination?.total || 0} amazing applications
        </p>
      </div>

      <AppsFilters
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      <AppsGrid
        apps={data?.apps || []}
        loading={isLoading}
        error={error?.message || null}
      />

      {data?.pagination && (
        <AppsPagination
          pagination={data.pagination}
          currentPage={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
