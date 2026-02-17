"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApps } from "@/src/hooks/queries/useApps";
import { AppsFilters, AppsFiltersState } from "@/src/components/apps/appsFilters/AppsFilters";
import { AppsGrid } from "@/src/components/apps/appsGrid/AppsGrid";
import { AppsPagination } from "@/src/components/apps/appsPagination/AppsPagination";
import { useDebounce } from "@/src/hooks/useDebounce";
import { usePagination } from "@/src/hooks/usePagination";
import style from "./page.module.scss";

export default function AppsPage() {
  const searchParams = useSearchParams();

  const { currentPage, goToPage, resetPage } = usePagination(1);

  const [filters, setFilters] = useState<AppsFiltersState>({
    searchQuery: searchParams.get("search") ?? "",
    sortBy: (searchParams.get("sortBy") as AppsFiltersState["sortBy"]) ?? "downloadCount",
    order: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    categoryId: searchParams.get("categoryId") ?? "",
    platform: searchParams.get("platform") ?? "",
    status: searchParams.get("status") ?? "",
  });

  const debouncedSearch = useDebounce(filters.searchQuery, 400);

  const { data, isLoading, error } = useApps({
    page: currentPage,
    limit: 20,
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId || undefined,
    sortBy: filters.sortBy,
    order: filters.order,
    platform: filters.platform || undefined,
    status: filters.status || undefined,
  });

  const handleFiltersChange = useCallback(
    (next: AppsFiltersState) => {
      setFilters(next);
      resetPage();
    },
    [resetPage]
  );

  return (
    <div className={style.appsPage}>
      <div className={style.header}>
        <h1 className={style.title}>
          Discover <span className={style.titleAccent}>Applications</span>
        </h1>
        <p className={style.subtitle}>
          Browse our collection of {data?.pagination?.total ?? 0} amazing applications
        </p>
      </div>

      <div className={style.contentWrapper}>
        <div className={style.mainContent}>
          <AppsGrid
            apps={data?.apps ?? []}
            loading={isLoading}
            error={error?.message ?? null}
          />

          {data?.pagination && (
            <AppsPagination
              totalPages={data.pagination.totalPages}
              currentPage={currentPage}
              onPageChange={goToPage}
            />
          )}
        </div>

        <AppsFilters
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>
    </div>
  );
}
