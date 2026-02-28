"use client";

import { useState } from "react";
import { NewsItem } from "@/src/types/Entities";
import { useGetNewsQuery, useDeleteNewsMutation } from "@/src/features/api/newsApi";
import NewsTable from "@/src/components/admin/news/NewsTable/NewsTable";
import NewsModal from "@/src/components/admin/news/NewsModal/NewsModal";
import DeleteNewsModal from "@/src/components/admin/news/DeleteNewsModal/DeleteNewsModal";
import s from "../admin.module.scss";

export default function AdminNewsPage() {
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, isLoading, isError } = useGetNewsQuery({ limit: 50 });
    const items = data?.news ?? [];
    const total = data?.pagination.total ?? 0;

    const openCreate = () => { setEditingItem(null); setModalOpen(true); };
    const openEdit = (item: NewsItem) => { setEditingItem(item); setModalOpen(true); };
    const openDelete = (item: NewsItem) => { setDeletingItem(item); setDeleteOpen(true); };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>News</h1>
                    <p className={s.pageSubtitle}>{total} records</p>
                </div>
                <button className={s.btnPrimary} onClick={openCreate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New record
                </button>
            </div>

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading...</p></div>
                ) : isError ? (
                    <div className={s.errorState}><p>Failed to load news</p></div>
                ) : items.length === 0 ? (
                    <div className={s.empty}><p>No news</p></div>
                ) : (
                    <NewsTable items={items} onEdit={openEdit} onDelete={openDelete} />
                )}
            </div>

            <NewsModal
                isOpen={modalOpen}
                item={editingItem}
                onClose={() => setModalOpen(false)}
                onSaved={() => setModalOpen(false)}
            />
            <DeleteNewsModal
                isOpen={deleteOpen}
                item={deletingItem}
                onClose={() => setDeleteOpen(false)}
                onDeleted={() => setDeleteOpen(false)}
            />
        </div>
    );
}
