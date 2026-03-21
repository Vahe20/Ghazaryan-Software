import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { useDeleteCategoryMutation } from "@/src/features/api/categoriesApi";
import { extractErrorMessage } from "@/src/lib/utils";

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

    const errorMessage = error ? extractErrorMessage(error, "Failed to delete") : null;

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
