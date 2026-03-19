import { useState } from "react";
import { AdminUser } from "@/src/types/Admin";
import { useUpdateUserRoleMutation } from "@/src/features/api/adminApi";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import UserAvatar from "../UserAvatar/UserAvatar";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import s from "./RoleModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;
type Role = typeof ROLES[number];

interface RoleModalProps {
    isOpen: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function RoleModal({ isOpen, user, onClose, onSaved }: RoleModalProps) {
    const [role, setRole] = useState<Role>(user?.role ?? "USER");
    const [updateUserRole, { isLoading, error }] = useUpdateUserRoleMutation();

    const handleSave = async () => {
        if (!user) return;
        try {
            await updateUserRole({ userId: user.id, role }).unwrap();
            onSaved();
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | null => {
        if (!error) return null;
        if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
            return error.data.message as string;
        }
        return "Failed to update role";
    };

    const errorMessage = getErrorMessage(error);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Role"
            maxWidth={400}
            footer={
                <>
                    <button className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={btns.btnPrimary} onClick={handleSave} disabled={isLoading || role === user?.role}>
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </>
            }
        >
            {user && (
                <div className={s.userInfo}>
                    <UserAvatar user={user} />
                    <div>
                        <p className={s.userNameText}>{user.userName}</p>
                        <p className={s.userEmailText}>{user.email}</p>
                    </div>
                </div>
            )}
            {errorMessage && <div className={form.alertError}>{errorMessage}</div>}
            <div className={form.formGroup}>
                <label className={form.formLabel}>Role</label>
                <select className={form.formSelect} value={role} onChange={e => setRole(e.target.value as Role)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </BaseModal>
    );
}
