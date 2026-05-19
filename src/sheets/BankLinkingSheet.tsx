import { useState, useRef, useEffect } from 'react';
import type { BankDetailsV2 } from '../types-v2';

interface BankLinkingSheetProps {
    onSubmit: (data: BankDetailsV2) => void;
    onClose: () => void;
    userName: string;
    existingData?: BankDetailsV2 | null;
}

const BANKS = [
    'Access Bank',
    'Fidelity Bank',
    'First Bank',
    'GTBank',
    'Kuda',
    'Moniepoint',
    'OPay',
    'Palmpay',
    'Polaris Bank',
    'Stanbic IBTC',
    'Sterling Bank',
    'UBA',
    'Union Bank',
    'Wema Bank',
    'Zenith Bank',
];

export function BankLinkingSheet({
    onSubmit,
    onClose,
    userName,
    existingData,
}: BankLinkingSheetProps) {
    const readOnly = !!existingData;

    const [selectedBank, setSelectedBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifiedName, setVerifiedName] = useState('');
    const sheetRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Auto-verify when 10 digits entered
    useEffect(() => {
        if (accountNumber.length === 10) {
            setVerifying(true);
            setVerifiedName('');
            const timer = setTimeout(() => {
                setVerifying(false);
                setVerifiedName(userName.toUpperCase());
            }, 2000);
            return () => clearTimeout(timer);
        }
        setVerifiedName('');
        setVerifying(false);
    }, [accountNumber, userName]);

    const canSubmit = !!selectedBank && !!verifiedName;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            bankName: selectedBank,
            accountNumber,
            accountName: verifiedName,
        });
    };

    if (readOnly && existingData) {
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
                    aria-label="Bank Details"
                    className="bg-[#f5f5f5] rounded-t-[14px] w-full max-h-[85dvh] flex flex-col animate-slide-up outline-none"
                    style={{
                        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                    }}
                >
                    <div className="flex items-center px-[20px] pt-[16px] pb-[12px] relative">
                        <button
                            onClick={onClose}
                            className="text-[#25D366] text-[15px] font-medium cursor-pointer active:opacity-60"
                        >
                            Close
                        </button>
                        <span className="text-[15px] font-semibold text-[#111] absolute left-1/2 -translate-x-1/2">
                            Bank Details
                        </span>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto px-[20px] pb-4"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                        }}
                    >
                        <ReadOnlyField
                            label="Bank"
                            value={existingData.bankName}
                        />
                        <ReadOnlyField
                            label="Account Number"
                            value={existingData.accountNumber}
                        />
                        <ReadOnlyField
                            label="Account Name"
                            value={existingData.accountName}
                        />
                    </div>
                </div>
            </div>
        );
    }

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
                aria-label="Link Bank Account"
                className="bg-[#f5f5f5] rounded-t-[14px] w-full max-h-[92dvh] h-[92dvh] sm:max-h-[85dvh] sm:h-auto flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-[8px] pb-[4px]">
                    <div className="w-[36px] h-[4px] rounded-full bg-[#d0d0d0]" />
                </div>

                {/* Header: Cancel | Title | dots */}
                <div className="flex items-center px-[20px] pt-[4px] pb-[10px] relative">
                    <button
                        onClick={onClose}
                        className="text-[#25D366] text-[15px] font-medium cursor-pointer active:opacity-60 z-10"
                    >
                        Cancel
                    </button>
                    <span className="text-[15px] font-semibold text-[#111] absolute left-1/2 -translate-x-1/2">
                        Link Bank Account
                    </span>
                </div>

                {/* Progress bar */}
                <div className="px-[20px] pb-[20px]">
                    <div className="h-[3px] bg-[#e0e0e0] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#25D366] rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${canSubmit ? 100 : selectedBank ? 50 : 0}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Title + subtitle */}
                <div className="px-[20px] pb-[20px]">
                    <h2 className="text-[22px] font-bold text-[#111] leading-tight">
                        Link Your Bank Account
                    </h2>
                    <p className="text-[14px] text-[#666] mt-[6px] leading-[1.4]">
                        Choose your bank and enter your account number for
                        automatic savings.
                    </p>
                </div>

                {/* Form content */}
                <div
                    className="flex-1 overflow-y-auto px-[20px]"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    {/* Bank dropdown picker */}
                    <BankPicker
                        value={selectedBank}
                        onChange={setSelectedBank}
                    />

                    {/* Account number input */}
                    <div className="mt-[16px]">
                        <div className="bg-white rounded-[12px] px-[16px] py-[14px] border border-transparent">
                            <label
                                htmlFor="field-account-number"
                                className="block text-[13px] font-semibold text-[#111] mb-[2px]"
                            >
                                Account Number
                            </label>
                            <input
                                id="field-account-number"
                                ref={accountRef}
                                type="text"
                                inputMode="numeric"
                                value={accountNumber}
                                onChange={(e) =>
                                    setAccountNumber(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 10)
                                    )
                                }
                                placeholder="Enter 10-digit account number"
                                className="w-full text-[15px] text-[#333] bg-transparent outline-none placeholder:text-[#999]"
                            />
                        </div>
                        <p className="text-[12px] text-[#666] mt-[6px] px-[4px] leading-[1.4]">
                            {selectedBank
                                ? `Your ${selectedBank} NUBAN account number`
                                : 'Select a bank first'}
                        </p>
                    </div>

                    {/* Verification status */}
                    {verifying && (
                        <div className="flex items-center gap-[8px] mt-[16px] px-[4px]">
                            <svg
                                className="animate-spin"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="6.5"
                                    stroke="#e0e0e0"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M14.5 8a6.5 6.5 0 00-6.5-6.5"
                                    stroke="#25D366"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="text-[13px] text-[#666]">
                                Verifying account...
                            </span>
                        </div>
                    )}

                    {verifiedName && !verifying && (
                        <div className="flex items-center gap-[8px] mt-[16px] bg-[#f0faf4] rounded-[12px] px-[16px] py-[12px]">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                                    fill="#25D366"
                                />
                            </svg>
                            <span className="text-[15px] font-bold text-[#111]">
                                {verifiedName}
                            </span>
                        </div>
                    )}
                </div>

                {/* Save button */}
                <div className="px-[20px] pt-[12px] pb-[4px] shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`w-full py-[13px] text-[15px] font-semibold text-center rounded-full transition-colors ${
                            canSubmit
                                ? 'bg-[#25D366] text-white cursor-pointer active:bg-[#1fba59]'
                                : 'bg-[#e8e8e8] text-[#888] cursor-default'
                        }`}
                    >
                        Save Bank Details
                    </button>
                </div>

                {/* Managed by footer */}
                <div className="flex items-center justify-center gap-[6px] py-[10px] px-[20px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"
                            fill="#25D366"
                        />
                    </svg>
                    <span className="text-[12px] text-[#666]">
                        Managed by Gemynate.
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ── Bank dropdown picker (matches StatePicker pattern) ── */

function BankPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = BANKS.filter((b) =>
        b.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch('');
            }
        }
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="relative" ref={containerRef}>
            <div
                id="bank-picker-trigger"
                role="combobox"
                aria-expanded={open}
                aria-controls="bank-picker-list"
                aria-haspopup="listbox"
                className={`bg-white rounded-[12px] px-[16px] py-[14px] border transition-colors cursor-pointer ${
                    open ? 'border-[#25D366]' : 'border-transparent'
                }`}
                onClick={() => {
                    setOpen(!open);
                    setSearch('');
                }}
            >
                <label className="block text-[13px] font-semibold text-[#111] mb-[2px]">
                    Bank
                </label>
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[15px] ${value ? 'text-[#333]' : 'text-[#999]'}`}
                    >
                        {value || 'Select your bank'}
                    </span>
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    >
                        <path
                            d="M1 1l4 4 4-4"
                            stroke="#999"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            <p className="text-[12px] text-[#666] mt-[6px] px-[4px]">
                The bank you want to link for auto-debit
            </p>

            {open && (
                <div
                    id="bank-picker-list"
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-[4px] bg-white border border-[#e0e0e0] rounded-[12px] shadow-lg z-10 overflow-hidden"
                >
                    <div className="p-[10px] border-b border-[#f0f0f0]">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search bank..."
                            className="w-full px-[10px] py-[8px] text-[14px] text-[#333] bg-[#f5f5f5] rounded-[8px] outline-none border-none"
                        />
                    </div>
                    <div
                        className="max-h-[200px] overflow-y-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {filtered.length === 0 ? (
                            <div className="px-[16px] py-[12px] text-[13px] text-[#666]">
                                No bank found
                            </div>
                        ) : (
                            filtered.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => {
                                        onChange(b);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-[16px] py-[11px] text-[14px] cursor-pointer active:bg-[#f0f0f0] ${
                                        b === value
                                            ? 'text-[#25D366] font-semibold bg-[#f0faf4]'
                                            : 'text-[#333]'
                                    }`}
                                >
                                    {b}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Read-only field ─────────────────────────────────────── */

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="mt-[12px] first:mt-0">
            <div className="bg-white rounded-[12px] px-[16px] py-[14px]">
                <label className="block text-[12px] text-[#666] mb-[2px]">
                    {label}
                </label>
                <p className="text-[15px] text-[#333] font-medium">{value}</p>
            </div>
        </div>
    );
}
