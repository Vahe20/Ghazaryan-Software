"use client"

import { useAuthStore } from "@/src/store/AuthStore";

import { AppsList } from "@/src/components/library/appsList/AppsList";
import { AppInfo } from "@/src/components/library/appInfo/AppInfo";

import style from "./page.module.scss";

export default function library() {
    const { user, loading } = useAuthStore();
    console.log(user);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (<div>
            <h1>You must be logged in to view this page.</h1>
        </div>
        )
    }

    return (
        <div className={style.library}>
            <div className={style.apps}>
                <AppsList />
            </div>
            <div className={style.appInfo}>
                <AppInfo />
            </div>
        </div>
    )
}