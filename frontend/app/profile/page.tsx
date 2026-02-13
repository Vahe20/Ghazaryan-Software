"use client"

import { useAuthStore } from '@/src/store/AuthStore'
import style from './page.module.scss'
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface submitTypes {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

const onSubmit = (data: submitTypes) => {

};

export default function Profile() {
    const { user, loading, logout } = useAuthStore();
    const { register, handleSubmit } = useForm<submitTypes>();
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');

    const handleTopUp = () => {
        // TODO: Implement top-up logic
        console.log('Top up amount:', topUpAmount);
        setShowTopUpModal(false);
        setTopUpAmount('');
    };

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
            <div className={style.profileHeader}>
                <div className={style.avatarSection}>
                    <div className={style.avatarCircle}>
                        <span className={style.avatarInitial}>
                            {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : user.userName?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <button className={style.changeAvatarBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" />
                            <path d="M3 16V8C3 7.44772 3.44772 7 4 7H6.5L8 5H16L17.5 7H20C20.5523 7 21 7.44772 21 8V16C21 16.5523 20.5523 17 20 17H4C3.44772 17 3 16.5523 3 16Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </div>

                <div className={style.userInfo}>
                    <h1 className={style.userName}>{user.userName}</h1>
                    <p className={style.userEmail}>{user.email}</p>
                </div>
            </div>

            <div className={style.profileContent}>
                <div className={style.statsGrid}>
                    <div className={style.statCard}>
                        <div className={style.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={style.statInfo}>
                            <p className={style.statLabel}>Balance</p>
                            <p className={style.statValue}>${user.balance || '0.00'}</p>
                        </div>
                        <button 
                            className={style.topUpBtn}
                            onClick={() => setShowTopUpModal(true)}
                            title="Top up balance"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div className={style.statCard}>
                        <div className={style.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={style.statInfo}>
                            <p className={style.statLabel}>Applications</p>
                            <p className={style.statValue}>{user.purchases?.length || 0}</p>
                        </div>
                    </div>

                    <div className={style.statCard}>
                        <div className={style.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={style.statInfo}>
                            <p className={style.statLabel}>Member Since</p>
                            <p className={style.statValue}>2025</p>
                        </div>
                    </div>
                </div>

                <div className={style.dangerZone}>
                    <h2 className={style.sectionTitle}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Account Settings
                    </h2>
                    <div className={style.settingItem}>
                        <p className={style.settingLabel}>Change Password</p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input
                                {...register("currentPassword", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: "Password must contain uppercase, lowercase and number"
                                    }
                                })}
                                type="password"
                                placeholder="Current Password"
                                className={style.inputField}
                            />
                            <input
                                {...register("newPassword", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: "Password must contain uppercase, lowercase and number"
                                    },
                                    validate: (value, values) => value !== values.currentPassword
                                })}
                                type="password"
                                placeholder="New Password"
                                className={style.inputField}
                            />
                            <input
                                {...register("confirmNewPassword", {
                                    required: "Please confirm your new password",
                                    validate: (value, values) => value === values.newPassword
                                })}
                                type="password"
                                placeholder="Confirm New Password"
                                className={style.inputField}
                            />
                            <button
                                type="submit"
                                className={style.changePasswordBtn}>
                                Change Password
                            </button>
                        </form>
                    </div>
                    <button className={style.logoutBtn} onClick={logout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Top-up Modal */}
            {showTopUpModal && (
                <div className={style.modalOverlay} onClick={() => setShowTopUpModal(false)}>
                    <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h2>Top Up Balance</h2>
                            <button 
                                className={style.closeBtn}
                                onClick={() => setShowTopUpModal(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className={style.modalBody}>
                            <div className={style.currentBalance}>
                                <span>Current Balance:</span>
                                <strong>${user.balance || '0.00'}</strong>
                            </div>
                            <div className={style.inputGroup}>
                                <label htmlFor="topUpAmount">Amount (USD)</label>
                                <input
                                    id="topUpAmount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className={style.amountInput}
                                />
                            </div>
                            <div className={style.quickAmounts}>
                                <button onClick={() => setTopUpAmount('10')}>$10</button>
                                <button onClick={() => setTopUpAmount('25')}>$25</button>
                                <button onClick={() => setTopUpAmount('50')}>$50</button>
                                <button onClick={() => setTopUpAmount('100')}>$100</button>
                            </div>
                        </div>
                        <div className={style.modalFooter}>
                            <button 
                                className={style.cancelBtn}
                                onClick={() => setShowTopUpModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className={style.confirmBtn}
                                onClick={handleTopUp}
                                disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}