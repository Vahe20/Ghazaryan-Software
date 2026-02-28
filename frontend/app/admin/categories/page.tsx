"use client";

import { useState } from "react";
import { useGetCategoriesQuery } from "@/src/features/api/categoriesApi";
import CategoriesTable from "@/src/components/admin/categories/CategoriesTable/CategoriesTable";
import CategoryModal from "@/src/components/admin/categories/CategoryModal/CategoryModal";
import DeleteCategoryModal from "@/src/components/admin/categories/DeleteCategoryModal/DeleteCategoryModal";
import s from "../admin.module.scss";

interface Category { id: string; name: string; slug: string; }

export default function AdminCategoriesPage() {
    const [editingItem, setEditingItem] = useState<Category | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Category | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data: items = [], isLoading, isError } = useGetCategoriesQuery();

    const openCreate = () => { setEditingItem(null); setModalOpen(true); };
    const openEdit = (item: Category) => { setEditingItem(item); setModalOpen(true); };
    const openDelete = (item: Category) => { setDeletingItem(item); setDeleteOpen(true); };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Categories</h1>
                    <p className={s.pageSubtitle}>{items.length} categories</p>
                </div>
                <button className={s.btnPrimary} onClick={openCreate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New category
                </button>
            </div>

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading...</p></div>
                ) : isError ? (
                    <div className={s.errorState}><p>Failed to load categories</p></div>
                ) : items.length === 0 ? (
                    <div className={s.empty}><p>No categories</p></div>
                ) : (
                    <CategoriesTable items={items} onEdit={openEdit} onDelete={openDelete} />
                )}
            </div>

            <CategoryModal
                isOpen={modalOpen}
                item={editingItem}
                onClose={() => setModalOpen(false)}
                onSaved={() => setModalOpen(false)}
            />
            <DeleteCategoryModal
                isOpen={deleteOpen}
                item={deletingItem}
                onClose={() => setDeleteOpen(false)}
                onDeleted={() => setDeleteOpen(false)}
            />
        </div>
    );
}
