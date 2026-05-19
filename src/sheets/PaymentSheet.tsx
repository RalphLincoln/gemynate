import { useState, useEffect, useRef } from 'react';
import type { PaymentData } from '../types';

interface PaymentSheetProps {
    dailyAmount: string;
    onSubmit: (data: PaymentData) => void;
    onClose: () => void;
    existingData?: PaymentData | null;
}

export function PaymentSheet({
    dailyAmount,
    onSubmit,
    onClose,
    existingData,
}: PaymentSheetProps) {
    const readOnly = !!existingData;
    const [bvn, setBvn] = useState(existingData?.bvn || '');
    const [bankAccount, setBankAccount] = useState(
        existingData?.bankAccount || ''
    );
    const [consent, setConsent] = useState(existingData?.consentGiven || false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const canSubmit = bvn.length >= 10 && bankAccount.length >= 5 && consent;

    return (
        <div
            className="absolute inset-0 bg-black/35 flex items-end z-50 animate-backdrop-fade"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={sheetRef}
                tabIndex={-1}
                role="dialog"
                aria-label="Complete Payment"
                className="bg-white rounded-t-[14px] w-full max-h-[75%] flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        Complete Payment
                    </span>
                    <button
                        onClick={onClose}
                        className="absolute right-[20px] cursor-pointer active:opacity-60"
                    >
                        <svg width="16" height="16" viewBox="0 0 14 14">
                            <path
                                d="M1 1l12 12M13 1L1 13"
                                stroke="#999"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Form fields */}
                <div
                    className="flex-1 overflow-y-auto px-[20px] pb-4"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    <div className="mt-3 first:mt-0">
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                            BVN (Secured)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={bvn}
                            onChange={(e) =>
                                setBvn(
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 11)
                                )
                            }
                            placeholder="Enter BVN"
                            readOnly={readOnly}
                            className={`w-full border border-[#d0d0d0] rounded-lg px-3 py-2.5 text-[13px] text-[#333] outline-none ${readOnly ? 'bg-[#f0f0f0]' : 'bg-[#fafafa] focus:border-[#888]'}`}
                        />
                    </div>
                    <div className="mt-3">
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                            Bank Account
                        </label>
                        <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            placeholder="e.g. GTB — 0123456789"
                            readOnly={readOnly}
                            className={`w-full border border-[#d0d0d0] rounded-lg px-3 py-2.5 text-[13px] text-[#333] outline-none ${readOnly ? 'bg-[#f0f0f0]' : 'bg-[#fafafa] focus:border-[#888]'}`}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setConsent(!consent)}
                            className={`w-[18px] h-[18px] border-[1.5px] rounded flex-shrink-0 flex items-center justify-center text-[11px] cursor-pointer ${
                                consent
                                    ? 'border-[#25D366] bg-[#25D366] text-white'
                                    : 'border-[#888]'
                            }`}
                        >
                            {consent && '\u2713'}
                        </button>
                        <span className="text-[12px] text-[#444] leading-[1.3]">
                            I agree to daily debit of {'\u20A6'}
                            {dailyAmount} from my linked account
                        </span>
                    </div>
                </div>

                {/* Send button */}
                {canSubmit && !readOnly && (
                    <div className="px-[20px] pt-[12px]">
                        <button
                            onClick={() =>
                                onSubmit({
                                    bvn,
                                    bankAccount,
                                    consentGiven: consent,
                                })
                            }
                            className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59]"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
