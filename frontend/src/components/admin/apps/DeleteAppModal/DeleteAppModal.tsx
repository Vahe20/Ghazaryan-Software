import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteAppMutation } from "@/src/features/api/appsApi";
import { App } from "@/src/types/Entities";
import { extractErrorMessage } from "@/src/lib/utils";

interface DeleteAppModalProps {
    isOpen: boolean;
    app: App | null;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteAppModal({ isOpen, app, onClose, onDeleted }: DeleteAppModalProps) {
    const [deleteApp, { isLoading, error }] = useDeleteAppMutation();

    const handleDelete = async () => {
        if (!app) return;
        try {
            await deleteApp(app.id).unwrap();
            onDeleted();
        } catch (err) {
            console.error('Failed to delete app:', err);
        }
    };

    const errorMessage = error ? extractErrorMessage(error, "Failed to delete") : null;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title="Delete Application?"
            description={<>Are you sure you want to delete <strong>{app?.name}</strong>? All associated data will be removed permanently.</>}
            loading={isLoading}
            error={errorMessage}
        />
    );
}
