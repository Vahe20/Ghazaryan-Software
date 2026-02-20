"use client";

import ReactModal from "react-modal";
import s from "./ConfirmModal.module.scss";
import btns from "../../admin/shared/_buttons.module.scss";

if (typeof window !== "undefined") {
    ReactModal.setAppElement("body");
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    loading?: boolean;
    error?: string | null;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    loading = false,
    error,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
}: ConfirmModalProps) {
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            overlayClassName={s.overlay}
            className={s.modal}
            closeTimeoutMS={150}
        >
            <div className={s.icon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <h3 className={s.title}>{title}</h3>
            <p className={s.desc}>{description}</p>
            {error && <div className={s.error}>{error}</div>}
            <div className={s.actions}>
                <button className={btns.btnSecondary} onClick={onClose} disabled={loading}>
                    {cancelLabel}
                </button>
                <button className={btns.btnDanger} onClick={onConfirm} disabled={loading} style={{ padding: "10px 24px" }}>
                    {loading ? "Deleting..." : confirmLabel}
                </button>
            </div>
        </ReactModal>
    );
}
