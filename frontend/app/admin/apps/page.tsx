"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService } from "@/src/services/admin.service";
import { App } from "@/src/types/Entities";
import { useDebounce } from "@/src/hooks/useDebounce";
import AppModal from "@/src/components/admin/apps/AppModal/AppModal";
import DeleteAppModal from "@/src/components/admin/apps/DeleteAppModal/DeleteAppModal";
import AppsTable from "@/src/components/admin/apps/AppsTable/AppsTable";
import AppsToolbar from "@/src/components/admin/apps/AppsToolbar/AppsToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

interface Category { id: string; name: string; slug: string; }

export default function AdminAppsPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);

    const [editingApp, setEditingApp] = useState<App | null>(null);
    const [appModalOpen, setAppModalOpen] = useState(false);
    const [deletingApp, setDeletingApp] = useState<App | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getApps({
                page,
                limit: 15,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                categoryId: categoryFilter || undefined,
            });
            setApps(data.apps);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load apps");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter, categoryFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);
    useEffect(() => { AdminService.getCategories().then(setCategories).catch(() => {}); }, []);

    const openCreate = () => { setEditingApp(null); setAppModalOpen(true); };
    const openEdit = (app: App) => { setEditingApp(app); setAppModalOpen(true); };
    const openDelete = (app: App) => { setDeletingApp(app); setDeleteModalOpen(true); };

    const handleSaved = (saved: App) => {
        setApps(prev => {
            const idx = prev.findIndex(a => a.id === saved.id);
            return idx >= 0 ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev];
        });
        setAppModalOpen(false);
    };

    const handleDeleted = (id: string) => {
        setApps(prev => prev.filter(a => a.id !== id));
        setDeleteModalOpen(false);
        setPagination(p => ({ ...p, total: p.total - 1 }));
    };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Applications</h1>
                    <p className={s.pageSubtitle}>{pagination.total} apps in catalog</p>
                </div>
                <button className={s.btnPrimary} onClick={openCreate}>
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
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                onCategoryChange={setCategoryFilter}
            />

            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading apps...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : apps.length === 0 ? (
                    <div className={s.empty}><p>No apps found</p></div>
                ) : (
                    <AppsTable apps={apps} onEdit={openEdit} onDelete={openDelete} />
                )}
                {!loading && (
                    <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
                )}
            </div>

            <AppModal
                isOpen={appModalOpen}
                app={editingApp}
                categories={categories}
                onClose={() => setAppModalOpen(false)}
                onSaved={handleSaved}
            />
            <DeleteAppModal
                isOpen={deleteModalOpen}
                app={deletingApp}
                onClose={() => setDeleteModalOpen(false)}
                onDeleted={handleDeleted}
            />
        </div>
    );
}
