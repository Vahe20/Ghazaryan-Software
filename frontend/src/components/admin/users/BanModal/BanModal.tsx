import { useState } from "react";
import { AdminService, AdminUser } from "@/src/services/admin.service";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import UserAvatar from "../UserAvatar/UserAvatar";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";
import s from "./BanModal.module.scss";

const PRESETS = [
    { label: "1 hour",    hours: 1 },
    { label: "24 hours",  hours: 24 },
    { label: "3 days",    hours: 72 },
    { label: "7 days",    hours: 168 },
    { label: "30 days",   hours: 720 },
    { label: "Permanent", hours: null },
];

interface BanModalProps {
    isOpen: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onSaved: (updated: AdminUser) => void;
}

export default function BanModal({ isOpen, user, onClose, onSaved }: BanModalProps) {
    const [preset, setPreset] = useState<number | null>(24);
    const [reason, setReason] = useState("");
    const { loading, error, run } = useAsyncAction<AdminUser>("Failed to ban user");

    const handleBan = async () => {
        if (!user) return;
        const until = preset === null
            ? null
            : new Date(Date.now() + preset * 3600 * 1000).toISOString();
        const updated = await run(() =>
            AdminService.banUser(user.id, { reason: reason.trim() || undefined, until })
        );
        if (updated) onSaved(updated);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Ban User"
            maxWidth={460}
            footer={
                <>
                    <button className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={s.btnBan} onClick={handleBan} disabled={loading}>
                        {loading ? "Banning..." : "Ban User"}
                    </button>
                </>
            }
        >
            {user && (
                <div className={s.userInfo}>
                    <UserAvatar user={user} />
                    <div>
                        <p className={s.userName}>{user.userName}</p>
                        <p className={s.userEmail}>{user.email}</p>
                    </div>
                </div>
            )}

            {error && <div className={form.alertError}>{error}</div>}

            <div className={form.formGroup}>
                <label className={form.formLabel}>Ban Duration</label>
                <div className={s.presets}>
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            type="button"
                            className={`${s.presetChip} ${preset === p.hours ? s.active : ""}`}
                            onClick={() => setPreset(p.hours)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={form.formGroup}>
                <label className={form.formLabel}>
                    Reason <span className={s.optional}>(optional)</span>
                </label>
                <textarea
                    className={form.formTextarea}
                    placeholder="Describe the reason for the ban..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                />
            </div>

            <div className={s.warning}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {preset === null
                    ? "This will permanently ban the user until manually unbanned."
                    : `The user will be banned for ${PRESETS.find(p => p.hours === preset)?.label}.`}
            </div>
        </BaseModal>
    );
}
