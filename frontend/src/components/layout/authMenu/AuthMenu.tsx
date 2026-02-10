"use client"

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/AuthStore";
import { useState } from "react";
import style from "./AuthMenu.module.scss";

export function AuthMenu() {
  const router = useRouter();
  const { user, loading, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className={style.authLoading}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.spinner}>
          <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth")}
        className={style.authButton}
        type="button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 3V7M15 7V11M15 7H11M15 7H19M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className={style.userMenu}>
      <div className={style.userInfo}>
        <div className={style.userAvatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.userName} />
          ) : (
            <span>{user.userName[0].toUpperCase()}</span>
          )}
        </div>
        <div className={style.userDetails}>
          <span className={style.userName}>{user.userName}</span>
          <span className={style.userBalance}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V15M13 6C13 4.34315 10.7614 3 8 3C5.23858 3 3 4.34315 3 6C3 7.65685 5.23858 9 8 9C10.7614 9 13 10.3431 13 12C13 13.6569 10.7614 15 8 15C5.23858 15 3 13.6569 3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {Number(user.balance).toFixed(2)}
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className={style.logoutButton}
        disabled={isLoggingOut}
        type="button">
        {isLoggingOut ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={style.spinner}>
            <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 3L19 10M19 10L13 17M19 10H7M7 3H3V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
      </button>
    </div>
  );
}
