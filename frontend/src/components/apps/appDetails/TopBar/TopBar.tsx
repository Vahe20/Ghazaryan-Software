"use client";

import style from "./TopBar.module.scss";

interface TopBarProps {
    onBack: () => void;
}

export function TopBar({ onBack }: TopBarProps) {
    return (
        <div className={style.topBar}>
            <button onClick={onBack} className={style.backNavBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M19 12H5M12 19l-7-7 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Back
            </button>
        </div>
    );
}
