"use client"

import { useAuthStore } from '@/src/store/AuthStore';
import { useState } from 'react';
import ProfileHeader from '@/src/components/profile/profileHeader/ProfileHeader';
import StatsGrid from '@/src/components/profile/statsGrid/StatsGrid';
import AccountSettings from '@/src/components/profile/accountSettings/AccountSettings';
import TopUpModal from '@/src/components/profile/topUpModal/TopUpModal';
import style from './page.module.scss';

export default function Profile() {
    const { user, loading } = useAuthStore();
    const [showTopUpModal, setShowTopUpModal] = useState(false);

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
