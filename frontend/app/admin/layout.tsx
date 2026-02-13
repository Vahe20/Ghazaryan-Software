"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import style from './layout.module.scss';
import { useAuthStore } from '@/src/store/AuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const { user, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={style.loadingContainer}>
                <div className={style.loader}></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    const menuItems = [
        {
            title: 'Overview',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            path: '/admin',
        },
        {
            title: 'Users',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            path: '/admin/users',
        },
        {
            title: 'Applications',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            path: '/admin/apps',
        },
        {
            title: 'Orders',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            path: '/admin/orders',
        },
    ];

    return (
        <div className={style.adminLayout}>
            <aside className={style.sidebar}>
                <div className={style.sidebarHeader}>
                    <div className={style.logo}>
                        <div className={style.logoIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className={style.navigation}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${style.navItem} ${isActive ? style.active : ''}`}
                            >
                                <span className={style.navIcon}>{item.icon}</span>
                                <span className={style.navTitle}>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={style.sidebarFooter}>
                    <div className={style.userCard}>
                        <div className={style.userAvatar}>
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" />
                            ) : (
                                <span>{user.userName?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className={style.userInfo}>
                            <p className={style.userName}>{user.userName}</p>
                            <p className={style.userRole}>Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className={style.mainContent}>
                {children}
            </main>
        </div>
    );
}
