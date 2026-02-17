import { User } from '@/src/types/user.types';
import style from './ProfileHeader.module.scss';

interface ProfileHeaderProps {
    user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className={style.profileHeader}>
            <div className={style.avatarSection}>
                <div className={style.avatarCircle}>
                    <span className={style.avatarInitial}>
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" />
                        ) : (
                            user.userName?.charAt(0).toUpperCase()
                        )}
                    </span>
                </div>
                <button className={style.changeAvatarBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M3 16V8C3 7.44772 3.44772 7 4 7H6.5L8 5H16L17.5 7H20C20.5523 7 21 7.44772 21 8V16C21 16.5523 20.5523 17 20 17H4C3.44772 17 3 16.5523 3 16Z"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </button>
            </div>

            <div className={style.userInfo}>
                <h1 className={style.userName}>{user.userName}</h1>
                <p className={style.userEmail}>{user.email}</p>
            </div>
        </div>
    );
}
