import { useState, useEffect, useRef } from 'react';

interface WithdrawalSheetProps {
    pocketMoneyBalance: number;
    onSubmit: (amount: number) => void;
    onClose: () => void;
}

export function WithdrawalSheet({
    pocketMoneyBalance,
    onSubmit,
    onClose,
}: WithdrawalSheetProps) {
    const maxWithdrawable = pocketMoneyBalance;
    const [amount, setAmount] = useState('');
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);
    const [step, setStep] = useState<
        'form' | 'confirm' | 'processing' | 'success'
    >('form');

    const numAmount = parseInt(amount) || 0;
    const isValid = numAmount >= 100 && numAmount <= maxWithdrawable;
    const error =
        amount.length > 0 && numAmount > maxWithdrawable
            ? `Exceeds withdrawable limit (₦${maxWithdrawable.toLocaleString()})`
            : amount.length > 0 && numAmount > 0 && numAmount < 100
              ? 'Minimum withdrawal is ₦100'
              : '';

    const quickAmounts = [
        Math.floor(maxWithdrawable * 0.25),
        Math.floor(maxWithdrawable * 0.5),
        maxWithdrawable,
    ].filter((a) => a >= 100);

    function handleConfirm() {
        setStep('processing');
        setTimeout(() => setStep('success'), 2000);
    }

    return (
        <div
            className="absolute inset-0 bg-black/35 flex items-end z-50 animate-backdrop-fade"
            onClick={(e) => {
                if (e.target === e.currentTarget && step !== 'processing')
                    onClose();
            }}
        >
            <div
                ref={sheetRef}
                tabIndex={-1}
                role="dialog"
                aria-label="Withdraw from Pocket Money"
                className="bg-white rounded-t-[14px] w-full max-h-[75%] flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        {step === 'success'
                            ? 'Withdrawal Successful'
                            : 'Withdraw from Pocket Money'}
                    </span>
                    {step !== 'processing' && (
                        <button
                            onClick={
                                step === 'success'
                                    ? () => onSubmit(numAmount)
                                    : step === 'confirm'
                                      ? () => setStep('form')
                                      : onClose
                            }
                            className="absolute right-[20px] cursor-pointer active:opacity-60"
                        >
                            {step === 'confirm' ? (
                                <svg width="16" height="16" viewBox="0 0 14 14">
                                    <path
                                        d="M10 1L3 7l7 6"
                                        stroke="#999"
                                        strokeWidth="1.8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 14 14">
                                    <path
                                        d="M1 1l12 12M13 1L1 13"
                                        stroke="#999"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                <div
                    className="flex-1 overflow-y-auto px-[20px] pb-4"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    {step === 'form' && (
                        <>
                            {/* Balance card */}
                            <div className="bg-[#f0faf4] border border-[#c8ecd6] rounded-xl p-4 mb-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#666] mb-1">
                                    Pocket Money Balance
                                </p>
                                <p className="text-[24px] font-bold text-[#111]">
                                    ₦{pocketMoneyBalance.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    <p className="text-[12px] text-[#25D366] font-medium">
                                        Full balance available to withdraw
                                    </p>
                                </div>
                            </div>

                            {/* Amount input */}
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                                    Amount to withdraw
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#999]">
                                        ₦
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                )
                                            )
                                        }
                                        placeholder="0"
                                        className={`w-full border rounded-lg pl-7 pr-3 py-2.5 text-[13px] text-[#333] outline-none ${
                                            error
                                                ? 'border-[#e53935] bg-[#fff5f5]'
                                                : 'border-[#d0d0d0] bg-[#fafafa] focus:border-[#888]'
                                        }`}
                                    />
                                </div>
                                {error && (
                                    <p className="text-[11px] text-[#e53935] mt-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Quick amount buttons */}
                            {quickAmounts.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                    {quickAmounts.map((a, i) => (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => setAmount(String(a))}
                                            className={`flex-1 py-2 rounded-lg text-[12px] font-medium border cursor-pointer active:opacity-80 ${
                                                numAmount === a
                                                    ? 'bg-[#25D366] text-white border-[#25D366]'
                                                    : 'bg-[#fafafa] text-[#555] border-[#d0d0d0]'
                                            }`}
                                        >
                                            {i === quickAmounts.length - 1
                                                ? 'Max'
                                                : `₦${a.toLocaleString()}`}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <p className="text-[11px] text-[#999] mt-3">
                                Withdrawal will be sent to your linked bank
                                account.
                            </p>
                        </>
                    )}

                    {step === 'confirm' && (
                        <div className="py-2">
                            <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] text-[#999]">
                                        Amount
                                    </span>
                                    <span className="text-[15px] font-bold text-[#111]">
                                        ₦{numAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-[#eee]" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] text-[#999]">
                                        From
                                    </span>
                                    <span className="text-[13px] text-[#333]">
                                        Pocket Money
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] text-[#999]">
                                        To
                                    </span>
                                    <span className="text-[13px] text-[#333]">
                                        Linked bank account
                                    </span>
                                </div>
                                <div className="border-t border-[#eee]" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] text-[#999]">
                                        Balance after
                                    </span>
                                    <span className="text-[13px] text-[#333]">
                                        ₦
                                        {(
                                            pocketMoneyBalance - numAmount
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-[#999] mt-3 text-center">
                                Please confirm this withdrawal. This action
                                cannot be undone.
                            </p>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-10 h-10 border-3 border-[#e8e8e8] border-t-[#25D366] rounded-full animate-spin" />
                            <p className="text-[14px] text-[#555] mt-4 font-medium">
                                Processing withdrawal...
                            </p>
                            <p className="text-[12px] text-[#999] mt-1">
                                Please wait
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center py-6">
                            <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center mb-4">
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5 13l4 4L19 7"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <p className="text-[22px] font-bold text-[#111]">
                                ₦{numAmount.toLocaleString()}
                            </p>
                            <p className="text-[13px] text-[#999] mt-1">
                                has been withdrawn successfully
                            </p>
                            <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-xl p-4 w-full mt-5 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[12px] text-[#999]">
                                        New Pocket Money balance
                                    </span>
                                    <span className="text-[13px] font-semibold text-[#111]">
                                        ₦
                                        {(
                                            pocketMoneyBalance - numAmount
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[12px] text-[#999]">
                                        Sent to
                                    </span>
                                    <span className="text-[13px] text-[#333]">
                                        Linked bank account
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-[#999] mt-3">
                                Funds will arrive within 24 hours.
                            </p>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                {step === 'form' && isValid && (
                    <div className="px-[20px] pt-[12px] shrink-0">
                        <button
                            onClick={() => setStep('confirm')}
                            className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59]"
                        >
                            Continue
                        </button>
                    </div>
                )}
                {step === 'confirm' && (
                    <div className="px-[20px] pt-[12px] shrink-0">
                        <button
                            onClick={handleConfirm}
                            className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59]"
                        >
                            Confirm Withdrawal
                        </button>
                    </div>
                )}
                {step === 'success' && (
                    <div className="px-[20px] pt-[12px] shrink-0">
                        <button
                            onClick={() => onSubmit(numAmount)}
                            className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59]"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
