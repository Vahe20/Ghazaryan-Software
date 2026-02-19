import { memo, useCallback, useMemo } from "react";
import { useAuthStore } from "@/src/store/AuthStore";
import { User } from "@/src/types/Entities";
import { useState } from "react";
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
    const [success, setSuccess] = useState(false);
    const { topUpBalance } = useAuthStore();

    const parsedAmount = useMemo(() => parseFloat(topUpAmount), [topUpAmount]);
    const isAmountValid = useMemo(() => !isNaN(parsedAmount) && parsedAmount > 0, [parsedAmount]);

    const handleAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setTopUpAmount(e.target.value),
        []
    );

    const handleTopUp = useCallback(async () => {
        if (!isAmountValid) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        topUpBalance(parsedAmount);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setTopUpAmount("");
            onClose();
        }, 1500);
    }, [isAmountValid, parsedAmount, topUpBalance, onClose]);

    const handleOverlayClick = useCallback(() => {
        if (!loading) onClose();
    }, [loading, onClose]);

    if (!isOpen) return null;

    return (
        <div className={style.modalOverlay} onClick={handleOverlayClick}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2>Top Up Balance</h2>
                    <button className={style.closeBtn} onClick={onClose} disabled={loading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {success ? (
                    <div className={style.successState}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
                            <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>+${parsedAmount.toFixed(2)} added successfully!</p>
                    </div>
                ) : (
                    <>
                        <div className={style.modalBody}>
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
                                    step="0.1"
                                    placeholder="Enter amount"
                                    value={topUpAmount}
                                    onChange={handleAmountChange}
                                    className={style.amountInput}
                                    disabled={loading}
                                />
                            </div>
                            <div className={style.quickAmounts}>
                                {QUICK_AMOUNTS.map(amt => (
                                    <QuickAmountButton
                                        key={amt}
                                        amount={amt}
                                        disabled={loading}
                                        onSelect={setTopUpAmount}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button
                                className={style.confirmBtn}
                                onClick={handleTopUp}
                                disabled={!isAmountValid || loading}
                            >
                                {loading ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={style.spinner}>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {loading ? "Processing..." : "Confirm Payment"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

const QuickAmountButton = memo(function QuickAmountButton({
    amount,
    disabled,
    onSelect,
}: {
    amount: string;
    disabled: boolean;
    onSelect: (amount: string) => void;
}) {
    const handleClick = useCallback(() => onSelect(amount), [amount, onSelect]);
    return (
        <button onClick={handleClick} disabled={disabled}>
            ${amount}
        </button>
    );
});

export default TopUpModal;
