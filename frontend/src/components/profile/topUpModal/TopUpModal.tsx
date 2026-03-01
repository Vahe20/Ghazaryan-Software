import { memo, useCallback, useMemo, useState } from "react";
import { useCreateCheckoutSessionMutation } from "@/src/features/api/paymentApi";
import { User } from "@/src/types/Entities";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import style from "./TopUpModal.module.scss";

interface TopUpModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_AMOUNTS = ["10", "25", "50", "100"] as const;

const TopUpModal = memo(function TopUpModal({ user, isOpen, onClose }: TopUpModalProps) {
    const [topUpAmount, setTopUpAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [createCheckoutSession] = useCreateCheckoutSessionMutation();

    const parsedAmount = useMemo(() => parseFloat(topUpAmount), [topUpAmount]);
    const isAmountValid = useMemo(() => !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 10000, [parsedAmount]);

    const handleTopUp = useCallback(async () => {
        if (!isAmountValid) return;
        setLoading(true);
        try {
            const result = await createCheckoutSession(parsedAmount).unwrap();
            window.location.href = result.url;
        } catch (error) {
            console.error("Failed to create checkout session:", error);
            setLoading(false);
        }
    }, [isAmountValid, parsedAmount, createCheckoutSession]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={() => { if (!loading) onClose(); }}
            title="Top Up Balance"
            footer={
                <>
                    <button className={style.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                    <button className={style.confirmBtn} onClick={handleTopUp} disabled={!isAmountValid || loading}>
                        {loading ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={style.spinner}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2h4a2 2 0 012 2v16a2 2 0 01-2 2h-4M9 12h11m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        {loading ? "Redirecting..." : "Continue to Payment"}
                    </button>
                </>
            }
            maxWidth={420}
        >
            <div className={style.currentBalance}>
                <span>Current Balance:</span>
                <strong>${user.balance || "0.00"}</strong>
            </div>
            <div className={style.inputGroup}>
                <label htmlFor="topUpAmount">Amount (USD)</label>
                <input
                    id="topUpAmount"
                    type="number"
                    min="1"
                    max="10000"
                    step="0.01"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className={style.amountInput}
                    disabled={loading}
                />
                {parsedAmount > 10000 && (
                    <span className={style.errorText}>Maximum amount is $10,000</span>
                )}
            </div>
            <div className={style.quickAmounts}>
                {QUICK_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => setTopUpAmount(amt)} disabled={loading}>
                        ${amt}
                    </button>
                ))}
            </div>
            <div className={style.paymentInfo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>You'll be redirected to Stripe to complete your payment securely.</span>
            </div>
        </BaseModal>
    );
});

export default TopUpModal;
