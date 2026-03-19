"use client";

import style from "../page.module.scss";

interface ErrorStateProps {
    onBackToApps: () => void;
}

export function ErrorState({ onBackToApps }: ErrorStateProps) {
    return (
        <div className={style.errorPage}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h2>Application not found</h2>
            <p>This app might have been removed or the link is incorrect.</p>
            <button onClick={onBackToApps} className={style.backBtn}>
                Back to Apps
            </button>
        </div>
    );
}
