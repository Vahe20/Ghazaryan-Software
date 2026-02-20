import { Purchase } from "@/src/services/admin.service";
import StatusBadge from "../StatusBadge/StatusBadge";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import btns from "../../shared/_buttons.module.scss";
import form from "../../shared/_form.module.scss";
import misc from "../../shared/_misc.module.scss";
import { formatDate } from "@/src/lib/utils";

interface OrderDetailModalProps {
    isOpen: boolean;
    purchase: Purchase | null;
    onClose: () => void;
}

export default function OrderDetailModal({ isOpen, purchase, onClose }: OrderDetailModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Order Details"
            footer={<button className={btns.btnSecondary} onClick={onClose}>Close</button>}
        >
            {purchase && (
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Order ID</span>
                        <code style={{ fontSize: "12px", color: "var(--text-tertiary, #8a8d91)", wordBreak: "break-all" }}>{purchase.id}</code>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Status</span>
                        <div><StatusBadge status={purchase.status} /></div>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Customer</span>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{purchase.user.userName}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-tertiary)" }}>{purchase.user.email}</p>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Application</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div className={misc.appIcon}><img src={purchase.app.iconUrl} alt={purchase.app.name} /></div>
                            <span style={{ fontWeight: 600 }}>{purchase.app.name}</span>
                        </div>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Amount</span>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}>{Number(purchase.price).toLocaleString()} AMD</p>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Payment Method</span>
                        <p style={{ margin: 0 }}>{purchase.paymentMethod ?? "—"}</p>
                    </div>
                    <div className={form.formGroup}>
                        <span className={form.formLabel}>Date</span>
                        <p style={{ margin: 0 }}>{formatDate(purchase.purchasedAt, true)}</p>
                    </div>
                    {purchase.transactionId && (
                        <div className={form.formGroup}>
                            <span className={form.formLabel}>Transaction ID</span>
                            <code style={{ fontSize: "12px", wordBreak: "break-all" }}>{purchase.transactionId}</code>
                        </div>
                    )}
                </div>
            )}
        </BaseModal>
    );
}
