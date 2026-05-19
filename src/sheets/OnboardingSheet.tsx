import { useState, useRef, useEffect } from 'react';
import type { UserData } from '../types';

interface OnboardingSheetProps {
    onSubmit: (data: UserData) => void;
    onClose: () => void;
    existingData?: UserData | null;
}

export function OnboardingSheet({
    onSubmit,
    onClose,
    existingData,
}: OnboardingSheetProps) {
    const readOnly = !!existingData;
    const [form, setForm] = useState<UserData>(
        existingData || {
            firstName: '',
            lastName: '',
            gender: '',
            nin: '',
            state: '',
            address: '',
            email: '',
            referralCode: '',
        }
    );
    const [ninTouched, setNinTouched] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const update = (field: keyof UserData, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const ninError =
        ninTouched && form.nin.length > 0 && form.nin.length < 11
            ? `NIN must be 11 digits (${form.nin.length}/11)`
            : ninTouched && form.nin.length === 0
              ? 'NIN is required'
              : '';

    const canSubmit =
        form.firstName &&
        form.lastName &&
        form.gender &&
        form.nin.length === 11 &&
        form.state &&
        form.address;

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
                aria-label="Complete Onboarding"
                className="bg-white rounded-t-[14px] w-full max-h-[85dvh] flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        Complete Onboarding
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
                    <Field
                        label="First name"
                        value={form.firstName}
                        onChange={(v) => update('firstName', v)}
                        placeholder="Enter first name"
                        readOnly={readOnly}
                    />
                    <Field
                        label="Last name"
                        value={form.lastName}
                        onChange={(v) => update('lastName', v)}
                        placeholder="Enter last name"
                        readOnly={readOnly}
                    />
                    <GenderPicker
                        value={form.gender}
                        onChange={(v) => update('gender', v)}
                        readOnly={readOnly}
                    />
                    <Field
                        label="NIN (11 digits)"
                        value={form.nin}
                        onChange={(v) =>
                            update('nin', v.replace(/\D/g, '').slice(0, 11))
                        }
                        placeholder="Enter NIN"
                        inputMode="numeric"
                        readOnly={readOnly}
                        error={ninError}
                        onBlur={() => setNinTouched(true)}
                    />
                    <StatePicker
                        value={form.state}
                        onChange={(v) => update('state', v)}
                        readOnly={readOnly}
                    />
                    <Field
                        label="Address"
                        value={form.address}
                        onChange={(v) => update('address', v)}
                        placeholder="Enter address"
                        readOnly={readOnly}
                    />
                    <Field
                        label="Email (Optional)"
                        value={form.email || ''}
                        onChange={(v) => update('email', v)}
                        placeholder="Enter email"
                        readOnly={readOnly}
                    />
                    <Field
                        label="Referral code (Optional)"
                        value={form.referralCode || ''}
                        onChange={(v) => update('referralCode', v)}
                        placeholder="Enter code"
                        readOnly={readOnly}
                    />
                </div>

                {/* Send button - always visible */}
                {canSubmit && !readOnly && (
                    <div className="px-[20px] pt-[12px] shrink-0 sticky bottom-0 bg-white">
                        <button
                            onClick={() => onSubmit(form)}
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

const NIGERIAN_STATES = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'FCT - Abuja',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
];

function StatePicker({
    value,
    onChange,
    readOnly,
}: {
    value: string;
    onChange: (v: string) => void;
    readOnly?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = NIGERIAN_STATES.filter((s) =>
        s.toLowerCase().includes(search.toLowerCase())
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
        <div className="mt-3 relative" ref={containerRef}>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                State
            </label>
            {readOnly ? (
                <div className="w-full border border-[#d0d0d0] rounded-lg px-3 py-2.5 text-[13px] text-[#333] bg-[#f0f0f0]">
                    {value}
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(!open);
                            setSearch('');
                        }}
                        className={`w-full border rounded-lg px-3 py-2.5 text-[13px] text-left cursor-pointer flex items-center justify-between ${
                            value
                                ? 'text-[#333] border-[#d0d0d0]'
                                : 'text-[#999] border-[#d0d0d0]'
                        } bg-[#fafafa] focus:border-[#888] outline-none`}
                    >
                        <span>{value || 'Select state'}</span>
                        <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            className={`transition-transform ${open ? 'rotate-180' : ''}`}
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
                    </button>
                    {open && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#d0d0d0] rounded-lg shadow-lg z-10 overflow-hidden">
                            <div className="p-2 border-b border-[#eee]">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search state..."
                                    className="w-full px-2 py-1.5 text-[13px] text-[#333] bg-[#f5f5f5] rounded-md outline-none border-none"
                                />
                            </div>
                            <div
                                className="max-h-[180px] overflow-y-auto"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {filtered.length === 0 ? (
                                    <div className="px-3 py-2.5 text-[12px] text-[#999]">
                                        No match found
                                    </div>
                                ) : (
                                    filtered.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => {
                                                onChange(s);
                                                setOpen(false);
                                                setSearch('');
                                            }}
                                            className={`w-full text-left px-3 py-2 text-[13px] cursor-pointer hover:bg-[#f0f0f0] active:bg-[#e8e8e8] ${
                                                s === value
                                                    ? 'text-[#25D366] font-semibold bg-[#f0faf4]'
                                                    : 'text-[#333]'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function GenderPicker({
    value,
    onChange,
    readOnly,
}: {
    value: string;
    onChange: (v: string) => void;
    readOnly?: boolean;
}) {
    const options = ['Male', 'Female'];
    return (
        <div className="mt-3">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                Gender
            </label>
            <div className="flex gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onChange(opt)}
                        className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium border transition-colors ${
                            value === opt
                                ? 'bg-[#25D366] text-white border-[#25D366]'
                                : 'bg-[#fafafa] text-[#555] border-[#d0d0d0]'
                        } ${readOnly ? 'opacity-60' : 'cursor-pointer active:opacity-80'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    inputMode,
    readOnly,
    error,
    onBlur,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    inputMode?: 'numeric' | 'text';
    readOnly?: boolean;
    error?: string;
    onBlur?: () => void;
}) {
    return (
        <div className="mt-3 first:mt-0">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-[#999] mb-1">
                {label}
            </label>
            <input
                type="text"
                inputMode={inputMode}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full border rounded-lg px-3 py-2.5 text-[13px] text-[#333] outline-none ${error ? 'border-[#e53935] bg-[#fff5f5]' : 'border-[#d0d0d0]'} ${readOnly ? 'bg-[#f0f0f0]' : !error ? 'bg-[#fafafa] focus:border-[#888]' : ''}`}
            />
            {error && (
                <p className="text-[11px] text-[#e53935] mt-1">{error}</p>
            )}
        </div>
    );
}
