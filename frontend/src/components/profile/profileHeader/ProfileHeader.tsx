import { User } from '@/src/types/Entities';
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

            </div>

            <div className={style.userInfo}>
                <h1 className={style.userName}>{user.userName}</h1>
                <p className={style.userEmail}>{user.email}</p>
            </div>
        </div>
    );
}
