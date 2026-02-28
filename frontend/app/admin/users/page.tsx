"use client";

import { useState } from "react";
import { AdminUser } from "@/src/types/Admin";
import { useGetAdminUsersQuery } from "@/src/features/api/adminApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import RoleModal from "@/src/components/admin/users/RoleModal/RoleModal";
import DeleteUserModal from "@/src/components/admin/users/DeleteUserModal/DeleteUserModal";
import UsersTable from "@/src/components/admin/users/UsersTable/UsersTable";
import UsersToolbar from "@/src/components/admin/users/UsersToolbar/UsersToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading, isError } = useGetAdminUsersQuery({
        page,
        limit: 15,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
    });

    const users = data?.users ?? [];
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

    const openRoleEdit = (user: AdminUser) => { setEditingUser(user); setRoleModalOpen(true); };
    const openDelete = (user: AdminUser) => { setDeletingUser(user); setDeleteModalOpen(true); };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Users</h1>
                    <p className={s.pageSubtitle}>{pagination.total} registered users</p>
                </div>
            </div>

            <UsersToolbar
                search={search}
                roleFilter={roleFilter}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onRoleChange={(v) => { setRoleFilter(v); setPage(1); }}
            />

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading users...</p></div>
                ) : isError ? (
                    <div className={s.errorState}><p>Failed to load users</p></div>
                ) : users.length === 0 ? (
                    <div className={s.empty}><p>No users found</p></div>
                ) : (
                    <UsersTable users={users} onEditRole={openRoleEdit} onDelete={openDelete} />
                )}
                {!isLoading && (
                    <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
                )}
            </div>

            <RoleModal
                isOpen={roleModalOpen}
                user={editingUser}
                onClose={() => setRoleModalOpen(false)}
                onSaved={() => setRoleModalOpen(false)}
            />
            <DeleteUserModal
                isOpen={deleteModalOpen}
                user={deletingUser}
                onClose={() => setDeleteModalOpen(false)}
                onDeleted={() => setDeleteModalOpen(false)}
            />
        </div>
    );
}
