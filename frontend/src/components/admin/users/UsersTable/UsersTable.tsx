"use client";

import { AdminUser } from "@/src/types/Admin";
import RoleBadge from "../RoleBadge/RoleBadge";
import UserAvatar from "../UserAvatar/UserAvatar";
import { formatDate } from "@/src/lib/utils";
import s from "./UsersTable.module.scss";
import table from "../../shared/_table.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface UsersTableProps {
    users: AdminUser[];
    onEditRole: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}

export default function UsersTable({ users, onEditRole, onDelete }: UsersTableProps) {
    return (
        <table className={table.table}>
            <thead>
                <tr>
                    <th className={table.tableTh}>User</th>
                    <th className={table.tableTh}>Role</th>
                    <th className={table.tableTh}>Balance</th>
                    <th className={table.tableTh}>Purchases</th>
                    <th className={table.tableTh}>Downloads</th>
                    <th className={table.tableTh}>Reviews</th>
                    <th className={table.tableTh}>Joined</th>
                    <th className={table.tableTh}>Last Login</th>
                    <th className={table.tableTh}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr
                        key={user.id}
                        className={table.tableTr}
                        style={{ cursor: "pointer" }}
                    >
                        <td className={table.tableTd}>
                            <div className={s.userCell}>
                                <UserAvatar user={user} />
                                <div>
                                    <p className={s.userName}>{user.userName}</p>
                                    <p className={s.userEmail}>{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className={table.tableTd}><RoleBadge role={user.role} /></td>
                        <td className={table.tableTd}>{Number(user.balance).toLocaleString()} USD</td>
                        <td className={table.tableTd}>{user._count.purchases}</td>
                        <td className={table.tableTd}>{user._count.downloads}</td>
                        <td className={table.tableTd}>{user._count.reviews}</td>
                        <td className={table.tableTd}>{formatDate(user.createdAt)}</td>
                        <td className={table.tableTd}>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}</td>
                        <td className={table.tableTd} onClick={e => e.stopPropagation()}>
                            <div className={s.actions}>
                                <button className={btns.btnEdit} onClick={() => onEditRole(user)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Role
                                </button>
                                <button className={btns.btnDanger} onClick={() => onDelete(user)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
