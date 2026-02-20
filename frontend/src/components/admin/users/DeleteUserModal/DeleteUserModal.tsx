import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { AdminService, AdminUser } from "@/src/services/admin.service";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";

interface DeleteUserModalProps {
    isOpen: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onDeleted: (id: string) => void;
}

export default function DeleteUserModal({ isOpen, user, onClose, onDeleted }: DeleteUserModalProps) {
    const { loading, error, run } = useAsyncAction("Failed to delete user");

    const handleDelete = async () => {
        if (!user) return;
        await run(() => AdminService.deleteUser(user.id));
        if (!error) onDeleted(user.id);
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title="Delete User?"
            description={<>Are you sure you want to delete <strong>{user?.userName}</strong>? This action cannot be undone.</>}
            loading={loading}
            error={error}
        />
    );
}
