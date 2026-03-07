"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App } from "@/src/types/Entities";
import { useGetAppsQuery } from "@/src/features/api/appsApi";
import { useGetCategoriesQuery } from "@/src/features/api/categoriesApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import AppModal from "@/src/components/admin/apps/AppModal/AppModal";
import DeleteAppModal from "@/src/components/admin/apps/DeleteAppModal/DeleteAppModal";
import EditionsModal from "@/src/components/admin/apps/EditionsModal/EditionsModal";
import VersionsModal from "@/src/components/admin/apps/VersionsModal/VersionsModal";
import PromotionsModal from "@/src/components/admin/apps/PromotionsModal/PromotionsModal";
import AppsTable from "@/src/components/admin/apps/AppsTable/AppsTable";
import AppsToolbar from "@/src/components/admin/apps/AppsToolbar/AppsToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

type ModalType = 'create' | 'edit' | 'delete' | 'editions' | 'versions' | 'promotions' | null;

export default function AdminAppsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);

    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading, isError } = useGetAppsQuery({
        page,
        limit: 15,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
    });

    const { data: categoriesData } = useGetCategoriesQuery();
    const categories = categoriesData ?? [];

    const apps = data?.apps ?? [];
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

    const openModal = (type: ModalType, app?: App) => {
        setSelectedApp(app || null);
        setModalType(type);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedApp(null);
    };

    const handleViewApp = (app: App) => {
        router.push(`/apps/${app.slug}`);
    };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Applications Management</h1>
                    <p className={s.pageSubtitle}>
                        {pagination.total} apps • Manage apps, editions, versions, and promotions
                    </p>
                </div>
                <button className={s.btnPrimary} onClick={() => openModal('create')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New App
                </button>
            </div>

            <AppsToolbar
                search={search}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                categories={categories}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
                onCategoryChange={(v) => { setCategoryFilter(v); setPage(1); }}
            />

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}>
                        <div className={s.spinner} />
                        <p>Loading apps...</p>
                    </div>
                ) : isError ? (
                    <div className={s.errorState}>
                        <p>Failed to load apps</p>
                    </div>
                ) : apps.length === 0 ? (
                    <div className={s.empty}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 9h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p>No apps found</p>
                        <button className={s.btnSecondary} onClick={() => openModal('create')}>
                            Create First App
                        </button>
                    </div>
                ) : (
                    <AppsTable 
                        apps={apps} 
                        onEdit={(app) => openModal('edit', app)}
                        onDelete={(app) => openModal('delete', app)}
                        onViewApp={handleViewApp}
                        onManageEditions={(app) => openModal('editions', app)}
                        onManageVersions={(app) => openModal('versions', app)}
                        onManagePromotions={(app) => openModal('promotions', app)}
                    />
                )}
                {!isLoading && apps.length > 0 && (
                    <Pagination 
                        page={page} 
                        totalPages={pagination.totalPages} 
                        total={pagination.total} 
                        onPageChange={setPage} 
                    />
                )}
            </div>

            {/* Modals */}
            {(modalType === 'create' || modalType === 'edit') && (
                <AppModal
                    isOpen={true}
                    app={selectedApp}
                    categories={categories}
                    onClose={closeModal}
                    onSaved={closeModal}
                />
            )}

            {modalType === 'delete' && selectedApp && (
                <DeleteAppModal
                    isOpen={true}
                    app={selectedApp}
                    onClose={closeModal}
                    onDeleted={closeModal}
                />
            )}

            {modalType === 'editions' && selectedApp && (
                <EditionsModal
                    isOpen={true}
                    app={selectedApp}
                    onClose={closeModal}
                />
            )}

            {modalType === 'versions' && selectedApp && (
                <VersionsModal
                    isOpen={true}
                    app={selectedApp}
                    onClose={closeModal}
                />
            )}

            {modalType === 'promotions' && selectedApp && (
                <PromotionsModal
                    isOpen={true}
                    app={selectedApp}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
