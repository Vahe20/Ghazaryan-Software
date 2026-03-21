"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/src/features/api/categoriesApi";
import { extractErrorMessage } from "@/src/lib/utils";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface Category { id: string; name: string; slug: string; }

interface FormData { name: string; }

interface Props {
    isOpen: boolean;
    item: Category | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function CategoryModal({ isOpen, item, onClose, onSaved }: Props) {
    const [createCategory, { isLoading: creating, error: createError }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: updating, error: updateError }] = useUpdateCategoryMutation();

    const loading = creating || updating;
    const apiError = createError || updateError;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: { name: "" },
    });

    useEffect(() => {
        reset({ name: item?.name ?? "" });
    }, [item, isOpen, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (item) {
                await updateCategory({ id: item.id, data: { name: data.name } }).unwrap();
            } else {
                await createCategory({ name: data.name }).unwrap();
            }
            onSaved();
        } catch {
            
        }
    };

    const errorMessage = apiError ? extractErrorMessage(apiError, "Failed to save") : null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={item ? "Edit category" : "New category"}
            maxWidth={420}
            footer={
                <>
                    <button type="button" className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button type="submit" form="cat-modal-form" className={btns.btnPrimary} disabled={loading}>
                        {loading ? "Saving..." : item ? "Save" : "Create"}
                    </button>
                </>
            }
        >
            <form id="cat-modal-form" onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && <div className={form.alertError}>{errorMessage}</div>}
                <div className={form.formGroup}>
                    <label className={form.formLabel}>Name *</label>
                    <input
                        className={form.formInput}
                        autoFocus
                        placeholder="e.g.: DevTools"
                        {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && <span className={form.formError}>{errors.name.message}</span>}
                    <p className={form.formHint}>Slug will be generated automatically from the name.</p>
                </div>
            </form>
        </BaseModal>
    );
}
