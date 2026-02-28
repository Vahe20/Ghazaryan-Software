import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteUserMutation } from "@/src/features/api/adminApi";
import { AdminUser } from "@/src/types/Admin";

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
        } catch {}
    };

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | null => {
        if (!error) return null;
        if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
            return error.data.message as string;
        }
        return "Failed to delete user";
    };

    const errorMessage = getErrorMessage(error);

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
