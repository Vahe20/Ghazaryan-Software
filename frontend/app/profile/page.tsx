"use client"

import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from "@/src/features/api/baseApi";
import ProfileHeader from '@/src/components/profile/profileHeader/ProfileHeader';
import StatsGrid from '@/src/components/profile/statsGrid/StatsGrid';
import AccountSettings from '@/src/components/profile/accountSettings/AccountSettings';
import TopUpModal from '@/src/components/profile/topUpModal/TopUpModal';
import style from './page.module.scss';

export default function Profile() {
    const user = useAppSelector(s => s.auth.user);
    const loading = useAppSelector(s => s.auth.loading);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const payment = searchParams.get('payment');
        if (payment === 'success') {
            setPaymentStatus('success');
            // Invalidate user data to refresh balance
            dispatch(api.util.invalidateTags([{ type: 'User', id: 'CURRENT' }]));
            // Clear URL params after 3 seconds
            setTimeout(() => {
                setPaymentStatus(null);
                router.replace('/profile');
            }, 3000);
        } else if (payment === 'cancelled') {
            setPaymentStatus('cancelled');
            setTimeout(() => {
                setPaymentStatus(null);
                router.replace('/profile');
            }, 3000);
        }
    }, [searchParams, router, dispatch]);

    if (loading) {
        return (
            <div className={style.loadingContainer}>
                <div className={style.loader}></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={style.errorContainer}>
                <p>User not found. Please log in.</p>
            </div>
        );
    }

    return (
        <div className={style.profileContainer}>
            {paymentStatus === 'success' && (
                <div className={style.paymentNotification} data-status="success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Payment successful! Your balance has been updated.</span>
                </div>
            )}
            {paymentStatus === 'cancelled' && (
                <div className={style.paymentNotification} data-status="cancelled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Payment cancelled. No charges were made.</span>
                </div>
            )}
            
            <ProfileHeader user={user} />

            <div className={style.profileContent}>
                <StatsGrid 
                    user={user} 
                    onTopUpClick={() => setShowTopUpModal(true)} 
                />
                
                <AccountSettings user={user} />
            </div>

            <TopUpModal 
                user={user}
                isOpen={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
            />
        </div>
    );
}
