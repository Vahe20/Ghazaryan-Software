import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteCategoryMutation } from "@/src/features/api/categoriesApi";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface Category { id: string; name: string; slug: string; }

interface Props {
    isOpen: boolean;
    item: Category | null;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteCategoryModal({ isOpen, item, onClose, onDeleted }: Props) {
    const [deleteCategory, { isLoading, error }] = useDeleteCategoryMutation();

    const handleDelete = async () => {
        if (!item) return;
        try {
            await deleteCategory(item.id).unwrap();
            onDeleted();
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
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
            title="Delete category?"
            description={<>Are you sure you want to delete category <strong>{item?.name}</strong>? All apps in it will remain but lose this category.</>}
            loading={isLoading}
            error={errorMessage}
        />
    );
}
