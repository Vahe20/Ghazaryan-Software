"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { App, AppPromotion } from "@/src/types/Entities";
import {
    useGetAppPromotionsQuery,
    useCreatePromotionMutation,
    useUpdatePromotionMutation,
    useDeletePromotionMutation,
} from "@/src/features/api/appsApi";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import { extractErrorMessage, formatDate } from "@/src/lib/utils";
import s from "./PromotionsModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface PromotionsModalProps {
    isOpen: boolean;
    app: App;
    onClose: () => void;
}

interface PromotionFormData {
    discountType: "percent" | "amount";
    discountPercent: string;
    discountAmount: string;
    label: string;
    startsAt: string;
    endsAt: string;
}

const EMPTY_FORM: PromotionFormData = {
    discountType: "percent",
    discountPercent: "",
    discountAmount: "",
    label: "",
    startsAt: "",
    endsAt: "",
};

export default function PromotionsModal({ isOpen, app, onClose }: PromotionsModalProps) {
    const [editingPromotion, setEditingPromotion] = useState<AppPromotion | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data: promotions, isLoading } = useGetAppPromotionsQuery({ appId: app.id }, { skip: !isOpen });
    const [createPromotion, { isLoading: creating, error: createError }] = useCreatePromotionMutation();
    const [updatePromotion, { isLoading: updating, error: updateError }] = useUpdatePromotionMutation();
    const [deletePromotion, { isLoading: deleting }] = useDeletePromotionMutation();

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PromotionFormData>({
        defaultValues: EMPTY_FORM,
    });

    const discountType = watch("discountType");
    const loading = creating || updating || deleting;
    const apiError = createError || updateError;

    const appPrice = typeof app.price === 'number' ? app.price : parseFloat(String(app.price)) || 0;

    const onSubmit = async (data: PromotionFormData) => {
        const payload = {
            discountPercent: data.discountType === "percent" ? Math.round(parseFloat(data.discountPercent)) : null,
            discountAmount: data.discountType === "amount" ? parseFloat(data.discountAmount) : null,
            label: data.label || null,
            startsAt: new Date(data.startsAt),
            endsAt: new Date(data.endsAt),
        };

        try {
            if (editingPromotion) {
                await updatePromotion({
                    appId: app.id,
                    promotionId: editingPromotion.id,
                    data: payload,
                }).unwrap();
            } else {
                await createPromotion({
                    appId: app.id,
                    ...payload,
                }).unwrap();
            }
            reset(EMPTY_FORM);
            setEditingPromotion(null);
            setShowForm(false);
        } catch { }
    };

    const handleEdit = (promotion: AppPromotion) => {
        setEditingPromotion(promotion);
        reset({
            discountType: promotion.discountPercent ? "percent" : "amount",
            discountPercent: promotion.discountPercent ? String(promotion.discountPercent) : "",
            discountAmount: promotion.discountAmount ? String(promotion.discountAmount) : "",
            label: promotion.label || "",
            startsAt: new Date(promotion.startsAt).toISOString().slice(0, 16),
            endsAt: new Date(promotion.endsAt).toISOString().slice(0, 16),
        });
        setShowForm(true);
    };

    const handleDelete = async (promotionId: string) => {
        if (!confirm("Delete this promotion? This action cannot be undone.")) return;
        try {
            await deletePromotion({ appId: app.id, promotionId }).unwrap();
        } catch { }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingPromotion(null);
        reset(EMPTY_FORM);
    };

    const calculateDiscountedPrice = (promotion: AppPromotion) => {
        if (promotion.discountPercent) {
            return appPrice * (1 - promotion.discountPercent / 100);
        } else if (promotion.discountAmount) {
            return appPrice - promotion.discountAmount;
        }
        return appPrice;
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Promotions & Discounts - ${app.name}`}>
            <div className={s.container}>
                <div className={s.header}>
                    <div>
                        <p className={s.subtitle}>
                            Create limited-time promotions to boost sales
                        </p>
                        <div className={s.currentPrice}>
                            Current Price: <strong>${appPrice.toFixed(2)}</strong>
                        </div>
                    </div>
                    {!showForm && (
                        <button className={btns.btnPrimary} onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            New Promotion
                        </button>
                    )}
                </div>

                {showForm && (
                    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
                        <div className={s.formHeader}>
                            <h3>{editingPromotion ? 'Edit Promotion' : 'New Promotion'}</h3>
                            <button type="button" onClick={handleCancel} className={s.closeBtn}>×</button>
                        </div>

                        <div className={form.formGroup}>
                            <label className={form.formLabel}>Discount Type</label>
                            <div className={s.radioGroup}>
                                <label className={s.radioLabel}>
                                    <input type="radio" value="percent" {...register('discountType')} />
                                    <span>Percentage (%)</span>
                                </label>
                                <label className={s.radioLabel}>
                                    <input type="radio" value="amount" {...register('discountType')} />
                                    <span>Fixed Amount ($)</span>
                                </label>
                            </div>
                        </div>

                        {discountType === "percent" ? (
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Discount Percentage <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className={s.inputWithSuffix}>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        max="100"
                                        className={form.formInput}
                                        placeholder="25"
                                        {...register('discountPercent', {
                                            required: discountType === "percent" ? 'Percentage is required' : false,
                                            min: { value: 1, message: 'Min 1%' },
                                            max: { value: 100, message: 'Max 100%' },
                                        })}
                                    />
                                    <span className={s.suffix}>%</span>
                                </div>
                                {errors.discountPercent && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.discountPercent.message}</span>}
                            </div>
                        ) : (
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Discount Amount <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className={s.inputWithPrefix}>
                                    <span className={s.prefix}>$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={appPrice}
                                        className={form.formInput}
                                        placeholder="10.00"
                                        {...register('discountAmount', {
                                            required: discountType === "amount" ? 'Amount is required' : false,
                                            min: { value: 0.01, message: 'Min $0.01' },
                                            max: { value: appPrice, message: `Max $${appPrice}` },
                                        })}
                                    />
                                </div>
                                {errors.discountAmount && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.discountAmount.message}</span>}
                            </div>
                        )}

                        <div className={form.formGroup}>
                            <label className={form.formLabel}>Promotion Label</label>
                            <input
                                type="text"
                                className={form.formInput}
                                placeholder="e.g., WINTER SALE, LIMITED TIME OFFER"
                                {...register('label')}
                            />
                            <span style={{ color: '#8a8d91', fontSize: '12px' }}>Optional badge text shown to users</span>
                        </div>

                        <div className={form.formGrid}>
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Starts At <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    className={form.formInput}
                                    {...register('startsAt', { required: 'Start date is required' })}
                                />
                                {errors.startsAt && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.startsAt.message}</span>}
                            </div>

                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Ends At <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    className={form.formInput}
                                    {...register('endsAt', { required: 'End date is required' })}
                                />
                                {errors.endsAt && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.endsAt.message}</span>}
                            </div>
                        </div>

                        {apiError && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', marginTop: '16px' }}>
                                {extractErrorMessage(apiError, 'Failed to save promotion')}
                            </div>
                        )}

                        <div className={s.formActions}>
                            <button type="button" onClick={handleCancel} className={btns.btnSecondary}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className={btns.btnPrimary}>
                                {loading ? 'Saving...' : editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                            </button>
                        </div>
                    </form>
                )}

                <div className={s.promotionsList}>
                    {isLoading ? (
                        <div className={s.loading}>Loading promotions...</div>
                    ) : !promotions || promotions.length === 0 ? (
                        <div className={s.empty}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                                <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>No promotions yet</p>
                        </div>
                    ) : (
                        promotions.map(promotion => {
                            const isActive = promotion.isActive;
                            const discountedPrice = calculateDiscountedPrice(promotion);
                            const savings = appPrice - discountedPrice;

                            return (
                                <div key={promotion.id} className={`${s.promotionCard} ${isActive ? s.active : s.inactive}`}>
                                    <div className={s.promotionInfo}>
                                        <div className={s.promotionHeader}>
                                            <div className={s.discountBadge}>
                                                {promotion.discountPercent 
                                                    ? `-${promotion.discountPercent}%`
                                                    : `-$${promotion.discountAmount?.toFixed(2)}`
                                                }
                                            </div>
                                            {promotion.label && (
                                                <span className={s.labelBadge}>{promotion.label}</span>
                                            )}
                                        </div>

                                        <div className={s.priceComparison}>
                                            <span className={s.originalPrice}>${appPrice.toFixed(2)}</span>
                                            <span className={s.arrow}>→</span>
                                            <span className={s.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                                            <span className={s.savings}>(Save ${savings.toFixed(2)})</span>
                                        </div>

                                        <div className={s.promotionDates}>
                                            <div>
                                                <strong>Starts:</strong> {formatDate(promotion.startsAt)}
                                            </div>
                                            <div>
                                                <strong>Ends:</strong> {formatDate(promotion.endsAt)}
                                            </div>
                                        </div>

                                        <div className={s.statusRow}>
                                            <span className={`${s.stateBadge} ${isActive ? s.stateActive : s.stateInactive}`}>
                                                {isActive ? "ACTIVE NOW" : "NOT ACTIVE"}
                                            </span>
                                            <span className={s.createdAt}>Created {formatDate(promotion.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className={s.promotionActions}>
                                        <button
                                            onClick={() => handleEdit(promotion)}
                                            className={s.editBtn}
                                            disabled={loading}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promotion.id)}
                                            className={s.deleteBtn}
                                            disabled={loading}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </BaseModal>
    );
}
