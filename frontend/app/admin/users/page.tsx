"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService, AdminUser } from "@/src/services/admin.service";
import { useDebounce } from "@/src/hooks/useDebounce";
import s from "../admin.module.scss";

const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;
type Role = typeof ROLES[number];

function RoleBadge({ role }: { role: string }) {
    const cls = role === "ADMIN" ? s.badgeAdmin : role === "DEVELOPER" ? s.badgeDev : s.badgeUser;
    return <span className={`${s.badge} ${cls}`}>{role}</span>;
}

function Avatar({ user }: { user: AdminUser }) {
    return (
        <div className={s.avatar}>
            {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.userName} />
                : user.userName.charAt(0).toUpperCase()}
        </div>
    );
}

function formatDate(d: string) {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d));
}

// ── Role Edit Modal ───────────────────────────────────────────────────────────
function RoleModal({ user, onClose, onSaved }: {
    user: AdminUser;
    onClose: () => void;
    onSaved: (updated: AdminUser) => void;
}) {
    const [role, setRole] = useState<Role>(user.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await AdminService.updateUserRole(user.id, role);
            onSaved({ ...user, role });
        } catch (e: any) {
            setError(e.response?.data?.error?.message ?? "Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={s.modal} style={{ maxWidth: "400px" }}>
                <div className={s.modalHeader}>
                    <h2>Change Role</h2>
                    <button className={s.modalClose} onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                </div>
                <div className={s.modalBody}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <Avatar user={user} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>{user.userName}</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-tertiary)" }}>{user.email}</p>
                        </div>
                    </div>
                    {error && <div className={s.alertError}>{error}</div>}
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Role</label>
                        <select className={s.formSelect} value={role} onChange={e => setRole(e.target.value as Role)}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
                <div className={s.modalFooter}>
                    <button className={s.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={s.btnPrimary} onClick={handleSave} disabled={loading || role === user.role}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }: {
    user: AdminUser;
    onClose: () => void;
    onDeleted: (id: string) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await AdminService.deleteUser(user.id);
            onDeleted(user.id);
        } catch (e: any) {
            setError(e.response?.data?.error?.message ?? "Failed to delete user");
            setLoading(false);
        }
    };

    return (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={s.confirmModal}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h3>Delete User?</h3>
                <p>Are you sure you want to delete <strong>{user.userName}</strong>? This action cannot be undone.</p>
                {error && <div className={s.alertError}>{error}</div>}
                <div className={s.confirmButtons}>
                    <button className={s.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={s.btnDanger} onClick={handleDelete} disabled={loading} style={{ padding: "10px 24px" }}>
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);

    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getUsers({
                page,
                limit: 15,
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

    const handleRoleSaved = (updated: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setEditingUser(null);
    };

    const handleDeleted = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        setDeletingUser(null);
        setPagination(p => ({ ...p, total: p.total - 1 }));
    };

    return (
        <div className={s.page}>
            {/* Header */}
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Users</h1>
                    <p className={s.pageSubtitle}>{pagination.total} registered users</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className={s.toolbar}>
                <div className={s.searchBox}>
                    <svg className={s.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        className={s.searchInput}
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className={s.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading users...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : users.length === 0 ? (
                    <div className={s.empty}><p>No users found</p></div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th className={s.tableTh}>User</th>
                                <th className={s.tableTh}>Role</th>
                                <th className={s.tableTh}>Balance</th>
                                <th className={s.tableTh}>Purchases</th>
                                <th className={s.tableTh}>Downloads</th>
                                <th className={s.tableTh}>Reviews</th>
                                <th className={s.tableTh}>Joined</th>
                                <th className={s.tableTh}>Last Login</th>
                                <th className={s.tableTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={s.tableTr}>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Avatar user={user} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary, #e4e6eb)" }}>{user.userName}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-tertiary, #8a8d91)" }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={s.tableTd}><RoleBadge role={user.role} /></td>
                                    <td className={s.tableTd}>{Number(user.balance).toLocaleString()} AMD</td>
                                    <td className={s.tableTd}>{user._count.purchases}</td>
                                    <td className={s.tableTd}>{user._count.downloads}</td>
                                    <td className={s.tableTd}>{user._count.reviews}</td>
                                    <td className={s.tableTd}>{formatDate(user.createdAt)}</td>
                                    <td className={s.tableTd}>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}</td>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button className={s.btnEdit} onClick={() => setEditingUser(user)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                                Role
                                            </button>
                                            <button className={s.btnDanger} onClick={() => setDeletingUser(user)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className={s.pagination}>
                        <span className={s.paginationInfo}>
                            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                        </span>
                        <div className={s.paginationButtons}>
                            <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const p = i + Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
                                return (
                                    <button key={p} onClick={() => setPage(p)} className={`${s.pageBtn} ${p === page ? s.pageBtnActive : ""}`}>{p}</button>
                                );
                            })}
                            <button className={s.pageBtn} disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editingUser && <RoleModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={handleRoleSaved} />}
            {deletingUser && <DeleteModal user={deletingUser} onClose={() => setDeletingUser(null)} onDeleted={handleDeleted} />}
        </div>
    );
}
