import { AdminUser } from "@/src/types/Admin";
import misc from "../../shared/_misc.module.scss";

interface UserAvatarProps {
    user: AdminUser;
}

export default function UserAvatar({ user }: UserAvatarProps) {
    return (
        <div className={misc.avatar}>
            {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.userName} />
                : user.userName.charAt(0).toUpperCase()}
        </div>
    );
}
