import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { AdminService } from "@/src/services/admin.service";
import { App } from "@/src/types/Entities";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";

interface DeleteAppModalProps {
    isOpen: boolean;
    app: App | null;
    onClose: () => void;
    onDeleted: (id: string) => void;
}

export default function DeleteAppModal({ isOpen, app, onClose, onDeleted }: DeleteAppModalProps) {
    const { loading, error, run } = useAsyncAction("Failed to delete");

    const handleDelete = async () => {
        if (!app) return;
        await run(() => AdminService.deleteApp(app.id));
        if (!error) onDeleted(app.id);
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title="Delete Application?"
            description={<>Are you sure you want to delete <strong>{app?.name}</strong>? All associated data will be removed permanently.</>}
            loading={loading}
            error={error}
        />
    );
}
