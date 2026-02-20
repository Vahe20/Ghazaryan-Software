import { useState } from "react";
import { AdminService, AdminUser } from "@/src/services/admin.service";
import UserAvatar from "../UserAvatar/UserAvatar";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import s from "./RoleModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";

const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;
type Role = typeof ROLES[number];

interface RoleModalProps {
    isOpen: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onSaved: (updated: AdminUser) => void;
}

export default function RoleModal({ isOpen, user, onClose, onSaved }: RoleModalProps) {
    const [role, setRole] = useState<Role>(user?.role ?? "USER");
    const { loading, error, run } = useAsyncAction("Failed to update role");

    const handleSave = async () => {
        if (!user) return;
        await run(() => AdminService.updateUserRole(user.id, role));
        if (!error) onSaved({ ...user, role });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Role"
            maxWidth={400}
            footer={
                <>
                    <button className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={btns.btnPrimary} onClick={handleSave} disabled={loading || role === user?.role}>
                        {loading ? "Saving..." : "Save"}
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
            {error && <div className={form.alertError}>{error}</div>}
            <div className={form.formGroup}>
                <label className={form.formLabel}>Role</label>
                <select className={form.formSelect} value={role} onChange={e => setRole(e.target.value as Role)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </BaseModal>
    );
}
