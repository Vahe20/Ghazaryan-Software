"use client";

import { useAppSelector } from "@/src/app/hooks";
import { AppsList } from "@/src/components/library/appsList/AppsList";
import { AppInfo } from "@/src/components/library/appInfo/AppInfo";
import style from "./page.module.scss";

export default function Library() {
    const user = useAppSelector(s => s.auth.user);

    if (!user) {
        return (
            <div className={style.gate}>
                <div className={style.gate__orb} aria-hidden />
                <div className={style.gate__body}>
                    <div className={style.gate__iconRing}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h1>Sign in to continue</h1>
                    <p>You need to be logged in to access your library</p>
                </div>
            </div>
        );
    }

    return (
        <div className={style.shell}>
            <aside className={style.shell__rail}>
                <AppsList />
            </aside>
            <main className={style.shell__stage}>
                <AppInfo />
            </main>
        </div>
    );
}
