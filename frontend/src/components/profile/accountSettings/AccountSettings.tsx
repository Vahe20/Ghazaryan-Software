import { User } from '@/src/types/user.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/src/store/AuthStore';
import { AuthService } from '@/src/services/auth.service';
import style from './AccountSettings.module.scss';

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface DeleteFormData {
    password: string;
    confirmation: string;
}

interface AccountSettingsProps {
    user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
    const { logout } = useAuthStore();

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const {
        register: regPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormData>();

    const {
        register: regDelete,
        handleSubmit: handleDeleteSubmit,
        reset: resetDelete,
        watch: watchDelete,
        formState: { errors: deleteErrors },
    } = useForm<DeleteFormData>();

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setPasswordLoading(true);
        setPasswordError(null);
        try {
            await AuthService.changePassword(data.currentPassword, data.newPassword);
            setPasswordSuccess(true);
            resetPassword();
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err: any) {
            setPasswordError(
                err.response?.data?.error?.message || 'Failed to change password'
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const onDeleteSubmit = async (data: DeleteFormData) => {
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            await AuthService.deleteAccount(data.password);
            await logout();
        } catch (err: any) {
            setDeleteError(
                err.response?.data?.error?.message || 'Failed to delete account'
            );
            setDeleteLoading(false);
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteError(null);
        resetDelete();
    };

    return (
        <>
            <div className={style.dangerZone}>
                <h2 className={style.sectionTitle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Account Settings
                </h2>

                {/* Change Password */}
                <div className={style.settingItem}>
                    <p className={style.settingLabel}>Change Password</p>

                    {passwordSuccess && (
                        <div className={style.successBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Password changed successfully
                        </div>
                    )}

                    {passwordError && (
                        <div className={style.errorBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {passwordError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={style.passwordForm}>
                        <div className={style.inputWrap}>
                            <input
                                {...regPassword('currentPassword', {
                                    required: 'Current password is required',
                                })}
                                type="password"
                                placeholder="Current Password"
                                className={style.inputField}
                                disabled={passwordLoading}
                            />
                            {passwordErrors.currentPassword && (
                                <span className={style.error}>{passwordErrors.currentPassword.message}</span>
                            )}
                        </div>

                        <div className={style.inputWrap}>
                            <input
                                {...regPassword('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 8, message: 'At least 8 characters' },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Must contain uppercase, lowercase and number',
                                    },
                                    validate: (value, formValues) =>
                                        value !== formValues.currentPassword || 'New password must be different',
                                })}
                                type="password"
                                placeholder="New Password"
                                className={style.inputField}
                                disabled={passwordLoading}
                            />
                            {passwordErrors.newPassword && (
                                <span className={style.error}>{passwordErrors.newPassword.message}</span>
                            )}
                        </div>

                        <div className={style.inputWrap}>
                            <input
                                {...regPassword('confirmNewPassword', {
                                    required: 'Please confirm your new password',
                                    validate: (value, formValues) =>
                                        value === formValues.newPassword || 'Passwords do not match',
                                })}
                                type="password"
                                placeholder="Confirm New Password"
                                className={style.inputField}
                                disabled={passwordLoading}
                            />
                            {passwordErrors.confirmNewPassword && (
                                <span className={style.error}>{passwordErrors.confirmNewPassword.message}</span>
                            )}
                        </div>

                        <button type="submit" className={style.changePasswordBtn} disabled={passwordLoading}>
                            {passwordLoading ? (
                                <>
                                    <span className={style.spinner} />
                                    Saving...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </form>
                </div>

                {/* Actions */}
                <div className={style.actions}>
                    <button className={style.logoutBtn} onClick={logout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Logout
                    </button>

                    <button className={style.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className={style.modalOverlay} onClick={handleCloseDeleteModal}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h3 className={style.modalTitle}>Delete Account</h3>
                        <p className={style.modalDesc}>
                            This action is <strong>permanent</strong> and cannot be undone. All your data, purchases and reviews will be lost.
                        </p>

                        {deleteError && (
                            <div className={style.errorBanner}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                {deleteError}
                            </div>
                        )}

                        <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className={style.deleteForm}>
                            <div className={style.inputWrap}>
                                <input
                                    {...regDelete('password', { required: 'Password is required' })}
                                    type="password"
                                    placeholder="Enter your password"
                                    className={style.inputField}
                                    disabled={deleteLoading}
                                />
                                {deleteErrors.password && (
                                    <span className={style.error}>{deleteErrors.password.message}</span>
                                )}
                            </div>

                            <div className={style.inputWrap}>
                                <input
                                    {...regDelete('confirmation', {
                                        required: 'Please type DELETE to confirm',
                                        validate: v => v === 'DELETE' || 'Type DELETE exactly',
                                    })}
                                    type="text"
                                    placeholder='Type "DELETE" to confirm'
                                    className={style.inputField}
                                    disabled={deleteLoading}
                                />
                                {deleteErrors.confirmation && (
                                    <span className={style.error}>{deleteErrors.confirmation.message}</span>
                                )}
                            </div>

                            <div className={style.modalActions}>
                                <button
                                    type="button"
                                    className={style.cancelBtn}
                                    onClick={handleCloseDeleteModal}
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={style.confirmDeleteBtn}
                                    disabled={deleteLoading || watchDelete('confirmation') !== 'DELETE'}
                                >
                                    {deleteLoading ? (
                                        <>
                                            <span className={style.spinner} />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete my account'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
