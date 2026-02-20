"use client";

import ReactModal from "react-modal";
import s from "./_modal.module.scss";

if (typeof window !== "undefined") {
    ReactModal.setAppElement("body");
}

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: number;
}

export default function BaseModal({ isOpen, onClose, title, children, footer, maxWidth = 640 }: BaseModalProps) {
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            overlayClassName={s.overlay}
            className={s.modal}
            style={{ content: { maxWidth } }}
            closeTimeoutMS={150}
        >
            <div className={s.header}>
                <h2>{title}</h2>
                <button className={s.close} onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
            <div className={s.body}>{children}</div>
            {footer && <div className={s.footer}>{footer}</div>}
        </ReactModal>
    );
}
