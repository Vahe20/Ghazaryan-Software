"use client";

import style from "../page.module.scss";

export function LoadingState() {
    return (
        <div className={style.loadingPage}>
            <svg className={style.spinner} viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" />
                <path d="M25 5 A20 20 0 0 1 45 25" fill="none" />
            </svg>
            <p>Loading application...</p>
        </div>
    );
}
