"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService, AdminUser } from "@/src/services/admin.service";
import { useDebounce } from "@/src/hooks/useDebounce";
import RoleModal from "@/src/components/admin/users/RoleModal/RoleModal";
import DeleteUserModal from "@/src/components/admin/users/DeleteUserModal/DeleteUserModal";
import UsersTable from "@/src/components/admin/users/UsersTable/UsersTable";
import UsersToolbar from "@/src/components/admin/users/UsersToolbar/UsersToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);

    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getUsers({
                page, limit: 15,
                search: debouncedSearch || undefined,
                role: roleFilter || undefined,
            });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, roleFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter]);

    const openRoleEdit = (user: AdminUser) => { setEditingUser(user); setRoleModalOpen(true); };
    const openDelete = (user: AdminUser) => { setDeletingUser(user); setDeleteModalOpen(true); };

    const handleRoleSaved = (updated: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setRoleModalOpen(false);
    };

    const handleDeleted = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        setDeleteModalOpen(false);
        setPagination(p => ({ ...p, total: p.total - 1 }));
    };

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
                onSearchChange={setSearch}
                onRoleChange={setRoleFilter}
            />

            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading users...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : users.length === 0 ? (
                    <div className={s.empty}><p>No users found</p></div>
                ) : (
                    <UsersTable users={users} onEditRole={openRoleEdit} onDelete={openDelete} />
                )}
                {!loading && (
                    <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
                )}
            </div>

            <RoleModal
                isOpen={roleModalOpen}
                user={editingUser}
                onClose={() => setRoleModalOpen(false)}
                onSaved={handleRoleSaved}
            />
            <DeleteUserModal
                isOpen={deleteModalOpen}
                user={deletingUser}
                onClose={() => setDeleteModalOpen(false)}
                onDeleted={handleDeleted}
            />
        </div>
    );
}
