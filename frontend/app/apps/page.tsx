"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppsFilters, AppsFiltersState } from "@/src/components/apps/appsFilters/AppsFilters";
import type { PlatformType, StatusType } from "@/src/types/Entities";
import { AppsGrid } from "@/src/components/apps/appsGrid/AppsGrid";
import { AppsPagination } from "@/src/components/apps/appsPagination/AppsPagination";
import { useDebounce } from "@/src/hooks/useDebounce";
import { usePagination } from "@/src/hooks/usePagination";
import { useGetAppsQuery } from "@/src/features/api/appsApi";
import style from "./page.module.scss";

export default function AppsPage() {
  const searchParams = useSearchParams();

  const { currentPage, goToPage, resetPage } = usePagination(1);

  const platformParam = searchParams.get("platform");
  const statusParam = searchParams.get("status");

  const platform = isPlatformType(platformParam) ? platformParam : "";
  const status = isStatusType(statusParam) ? statusParam : "";

  const [filters, setFilters] = useState<AppsFiltersState>({
    searchQuery: searchParams.get("search") ?? "",
    sortBy: (searchParams.get("sortBy") as AppsFiltersState["sortBy"]) ?? "downloadCount",
    order: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    categoryId: searchParams.get("categoryId") ?? "",
    platform,
    status,
  });

  const debouncedSearch = useDebounce(filters.searchQuery, 400);

  const { data, isLoading, error } = useGetAppsQuery({
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
            error={typeof error === "object" && error !== null ? "error" in error ? error.error : null : null}
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

const PLATFORM_VALUES: PlatformType[] = ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"];
const STATUS_VALUES: StatusType[] = ["BETA", "RELEASE"];

const isPlatformType = (value: string | null): value is PlatformType =>
  value !== null && PLATFORM_VALUES.includes(value as PlatformType);

const isStatusType = (value: string | null): value is StatusType =>
  value !== null && STATUS_VALUES.includes(value as StatusType);
