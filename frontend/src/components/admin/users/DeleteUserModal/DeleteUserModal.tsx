import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteUserMutation } from "@/src/features/api/adminApi";
import { AdminUser } from "@/src/types/Admin";
import { extractErrorMessage } from "@/src/lib/utils";

interface DeleteUserModalProps {
    isOpen: boolean;
    user: AdminUser | null;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteUserModal({ isOpen, user, onClose, onDeleted }: DeleteUserModalProps) {
    const [deleteUser, { isLoading, error }] = useDeleteUserMutation();

    const handleDelete = async () => {
        if (!user) return;
        try {
            await deleteUser(user.id).unwrap();
            onDeleted();
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const errorMessage = error ? extractErrorMessage(error, "Failed to delete user") : null;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title="Delete User?"
            description={<>Are you sure you want to delete <strong>{user?.userName}</strong>? This action cannot be undone.</>}
            loading={isLoading}
            error={errorMessage}
        />
    );
}
