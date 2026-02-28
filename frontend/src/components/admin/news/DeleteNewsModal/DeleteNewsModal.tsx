import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteNewsMutation } from "@/src/features/api/newsApi";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { NewsItem } from "@/src/types/Entities";

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
        } catch {}
    };

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | null => {
        if (!error) return null;
        if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
            return error.data.message as string;
        }
        return "Failed to delete";
    };

    const errorMessage = getErrorMessage(error);

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
