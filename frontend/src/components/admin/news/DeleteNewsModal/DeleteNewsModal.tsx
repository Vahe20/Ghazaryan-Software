import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteNewsMutation } from "@/src/features/api/newsApi";
import { NewsItem } from "@/src/types/Entities";
import { extractErrorMessage } from "@/src/lib/utils";

interface Props {
    isOpen: boolean;
    item: NewsItem | null;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteNewsModal({ isOpen, item, onClose, onDeleted }: Props) {
    const [deleteNews, { isLoading, error }] = useDeleteNewsMutation();

    const handleDelete = async () => {
        if (!item) return;
        try {
            await deleteNews(item.id).unwrap();
            onDeleted();
        } catch (err) {
            console.error('Failed to delete news:', err);
        }
    };

    const errorMessage = error ? extractErrorMessage(error, "Failed to delete") : null;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title="Delete news?"
            description={<>Are you sure you want to delete <strong>{item?.title}</strong>? This action cannot be undone.</>}
            loading={isLoading}
            error={errorMessage}
        />
    );
}
