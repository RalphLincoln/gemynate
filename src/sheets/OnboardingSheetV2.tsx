import { useState, useRef, useEffect } from 'react';
import type { UserDataV2 } from '../types-v2';

interface OnboardingSheetV2Props {
    onSubmit: (data: UserDataV2) => void;
    onClose: () => void;
    existingData?: UserDataV2 | null;
}

const STEPS = [
    {
        title: "Welcome! Let's get you set up",
        subtitle:
            'Please provide your full name to personalize your experience.',
    },
    {
        title: 'Next of Kin',
        subtitle:
            'We need your next of kin information for verification purposes.',
    },
    {
        title: 'Almost done!',
        subtitle: 'Verify your identity to activate your plan.',
    },
];

export function OnboardingSheetV2({
    onSubmit,
    onClose,
    existingData,
}: OnboardingSheetV2Props) {
    const readOnly = !!existingData;
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<UserDataV2>(
        existingData || {
            firstName: '',
            lastName: '',
            gender: '',
            nextOfKin: {
                fullName: '',
                gender: '',
                relationship: '',
                phoneNumber: '',
            },
            bvn: '',
            referralCode: '',
        }
    );
    const [bvnTouched, setBvnTouched] = useState(false);
    const [bvnVerifying, setBvnVerifying] = useState(false);
    const [bvnVerified, setBvnVerified] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Simulated BVN verification
    useEffect(() => {
        if (form.bvn.length === 11) {
            setBvnVerifying(true);
            setBvnVerified(false);
            const timer = setTimeout(() => {
                setBvnVerifying(false);
                setBvnVerified(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
        setBvnVerifying(false);
        setBvnVerified(false);
    }, [form.bvn]);

    const update = (field: keyof UserDataV2, value: string | object) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const updateNextOfKin = (field: string, value: string) =>
        setForm((prev) => ({
            ...prev,
            nextOfKin: {
                ...prev.nextOfKin,
                [field]: value,
            },
        }));

    // Per-step validation
    const stepValid = [
        // Step 0: name + gender
        !!(form.firstName && form.lastName && form.gender),
        // Step 1: Next of Kin fields
        !!(
            form.nextOfKin.fullName &&
            form.nextOfKin.gender &&
            form.nextOfKin.relationship &&
            form.nextOfKin.phoneNumber
        ),
        // Step 2: BVN 11 digits + verified
        bvnVerified,
    ];

    const canProceed = stepValid[step];
    const isLastStep = step === STEPS.length - 1;
    const progress = ((step + 1) / STEPS.length) * 100;

    const bvnError =
        bvnTouched && form.bvn.length > 0 && form.bvn.length < 11
            ? `BVN must be 11 digits (${form.bvn.length}/11)`
            : bvnTouched && form.bvn.length === 0
              ? 'BVN is required'
              : '';

    const handleContinue = () => {
        if (!canProceed) return;
        if (isLastStep) {
            onSubmit(form);
        } else {
            setStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep((s) => s - 1);
        else onClose();
    };

    // Read-only: show all fields flat
    if (readOnly) {
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
                    aria-label="Onboarding Details"
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
                            Your Details
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
                            label="First Name"
                            value={form.firstName}
                        />
                        <ReadOnlyField
                            label="Last Name"
                            value={form.lastName}
                        />
                        <ReadOnlyField label="Gender" value={form.gender} />
                        <ReadOnlyField
                            label="Next of Kin Name"
                            value={form.nextOfKin.fullName}
                        />
                        <ReadOnlyField
                            label="Next of Kin Gender"
                            value={form.nextOfKin.gender}
                        />
                        <ReadOnlyField
                            label="Relationship"
                            value={form.nextOfKin.relationship}
                        />
                        <ReadOnlyField
                            label="Next of Kin Phone"
                            value={form.nextOfKin.phoneNumber}
                        />
                        <ReadOnlyField
                            label="BVN"
                            value={form.bvn.replace(
                                /(\d{3})(\d{4})(\d{4})/,
                                '$1 •••• $3'
                            )}
                        />
                        {form.referralCode && (
                            <ReadOnlyField
                                label="Referral Code"
                                value={form.referralCode}
                            />
                        )}
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
                aria-label="Complete Onboarding"
                className="bg-[#f5f5f5] rounded-t-[14px] w-full max-h-[92dvh] h-[92dvh] sm:max-h-[85dvh] sm:h-auto flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-[8px] pb-[4px]">
                    <div className="w-[36px] h-[4px] rounded-full bg-[#d0d0d0]" />
                </div>

                {/* Header: Cancel | Title | ••• */}
                <div className="flex items-center px-[20px] pt-[4px] pb-[10px] relative">
                    <button
                        onClick={handleBack}
                        className="text-[#25D366] text-[15px] font-medium cursor-pointer active:opacity-60 z-10"
                    >
                        {step > 0 ? 'Back' : 'Cancel'}
                    </button>
                    <span className="text-[15px] font-semibold text-[#111] absolute left-1/2 -translate-x-1/2">
                        Personal Information
                    </span>
                </div>

                {/* Progress bar */}
                <div className="px-[20px] pb-[20px]">
                    <div className="h-[3px] bg-[#e0e0e0] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#25D366] rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Step title + subtitle */}
                <div className="px-[20px] pb-[20px]">
                    <h2 className="text-[22px] font-bold text-[#111] leading-tight">
                        {STEPS[step].title}
                    </h2>
                    <p className="text-[14px] text-[#666] mt-[6px] leading-[1.4]">
                        {STEPS[step].subtitle}
                    </p>
                </div>

                {/* Step content */}
                <div
                    className="flex-1 overflow-y-auto px-[20px]"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    {step === 0 && (
                        <>
                            <CardField
                                label="First Name"
                                value={form.firstName}
                                onChange={(v) => update('firstName', v)}
                                hint="Enter your first name"
                                autoFocus
                            />
                            <CardField
                                label="Last Name"
                                value={form.lastName}
                                onChange={(v) => update('lastName', v)}
                                hint="Enter your last name"
                            />
                            <div className="mt-[16px]">
                                <GenderPicker
                                    value={form.gender}
                                    onChange={(v) => update('gender', v)}
                                />
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <CardField
                                label="Full Name"
                                value={form.nextOfKin.fullName}
                                onChange={(v) => updateNextOfKin('fullName', v)}
                                hint="Enter next of kin's full name"
                                autoFocus
                            />
                            <div className="mt-[16px]">
                                <GenderPicker
                                    value={form.nextOfKin.gender}
                                    onChange={(v) =>
                                        updateNextOfKin('gender', v)
                                    }
                                />
                            </div>
                            <CardField
                                label="Relationship"
                                value={form.nextOfKin.relationship}
                                onChange={(v) =>
                                    updateNextOfKin('relationship', v)
                                }
                                hint="e.g., Father, Mother, Sibling, Spouse"
                            />
                            <CardField
                                label="Phone Number"
                                value={form.nextOfKin.phoneNumber}
                                onChange={(v) =>
                                    updateNextOfKin('phoneNumber', v)
                                }
                                hint="Enter phone number"
                                inputMode="tel"
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CardField
                                label="BVN"
                                value={form.bvn}
                                onChange={(v) =>
                                    update(
                                        'bvn',
                                        v.replace(/\D/g, '').slice(0, 11)
                                    )
                                }
                                hint="We cannot see, use, or share your BVN after verification. It is only to confirm your identity."
                                inputMode="numeric"
                                error={bvnError}
                                onBlur={() => setBvnTouched(true)}
                                autoFocus
                                masked
                            />
                            {bvnVerifying && (
                                <div className="flex items-center gap-[8px] mt-[10px] px-[4px]">
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
                                        Verifying BVN...
                                    </span>
                                </div>
                            )}
                            {bvnVerified && !bvnVerifying && (
                                <div className="flex items-center gap-[8px] mt-[10px] bg-[#f0faf4] rounded-[12px] px-[16px] py-[10px]">
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
                                    <span className="text-[14px] font-semibold text-[#111]">
                                        BVN Verified ✅
                                    </span>
                                </div>
                            )}
                            <CardField
                                label="Referral Code"
                                value={form.referralCode || ''}
                                onChange={(v) => update('referralCode', v)}
                                hint="Optional — enter if someone referred you"
                                optional
                            />
                        </>
                    )}
                </div>

                {/* Continue / Submit button — always visible */}
                <div className="px-[20px] pt-[12px] pb-[4px] shrink-0">
                    <button
                        onClick={handleContinue}
                        disabled={!canProceed}
                        className={`w-full py-[13px] text-[15px] font-semibold text-center rounded-full transition-colors ${
                            canProceed
                                ? 'bg-[#25D366] text-white cursor-pointer active:bg-[#1fba59]'
                                : 'bg-[#e8e8e8] text-[#888] cursor-default'
                        }`}
                    >
                        {isLastStep ? 'Submit' : 'Continue'}
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

/* ── Card-style input field ────────────────────────────── */

function CardField({
    label,
    value,
    onChange,
    hint,
    inputMode,
    error,
    onBlur,
    optional,
    autoFocus,
    masked,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    hint: string;
    inputMode?: 'numeric' | 'text' | 'tel';
    error?: string;
    onBlur?: () => void;
    optional?: boolean;
    autoFocus?: boolean;
    masked?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            // Small delay to avoid focus during animation
            const t = setTimeout(() => inputRef.current?.focus(), 350);
            return () => clearTimeout(t);
        }
    }, [autoFocus]);

    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="mt-[16px] first:mt-0">
            <div
                className={`bg-white rounded-[12px] px-[16px] py-[14px] border transition-colors ${
                    error ? 'border-[#e53935]' : 'border-transparent'
                }`}
                onClick={() => inputRef.current?.focus()}
            >
                <label
                    htmlFor={fieldId}
                    className="block text-[13px] font-semibold text-[#111] mb-[2px]"
                >
                    {label}
                    {optional && (
                        <span className="text-[#888] font-normal">
                            {' '}
                            (optional)
                        </span>
                    )}
                </label>
                <div className="flex items-center gap-[8px]">
                    <input
                        id={fieldId}
                        ref={inputRef}
                        type="text"
                        inputMode={inputMode}
                        autoComplete="off"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="flex-1 text-[15px] text-[#333] bg-transparent outline-none placeholder:text-[#999]"
                        style={
                            masked && !revealed
                                ? ({
                                      WebkitTextSecurity: 'disc',
                                      letterSpacing: '0.2em',
                                  } as React.CSSProperties)
                                : undefined
                        }
                    />
                    {masked && value.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRevealed((r) => !r);
                            }}
                            className="shrink-0 p-[4px] cursor-pointer active:opacity-60"
                            aria-label={revealed ? 'Hide BVN' : 'Show BVN'}
                        >
                            {revealed ? (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#888"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            ) : (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#888"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
            {error ? (
                <p className="text-[11px] text-[#e53935] mt-[6px] px-[4px]">
                    {error}
                </p>
            ) : (
                <p className="text-[12px] text-[#666] mt-[6px] px-[4px] leading-[1.4]">
                    {hint}
                </p>
            )}
        </div>
    );
}

/* ── Gender pill picker ────────────────────────────────── */

function GenderPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const options = ['Male', 'Female'];
    return (
        <fieldset className="border-none p-0 m-0">
            <legend className="block text-[13px] font-semibold text-[#111] mb-[8px] px-[4px]">
                Gender
            </legend>
            <div
                className="flex gap-[10px]"
                role="radiogroup"
                aria-label="Gender"
            >
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={value === opt}
                        onClick={() => onChange(opt)}
                        className={`flex-1 py-[13px] rounded-[12px] text-[14px] font-medium border transition-colors ${
                            value === opt
                                ? 'bg-[#25D366] text-white border-[#25D366]'
                                : 'bg-white text-[#555] border-transparent'
                        } cursor-pointer active:opacity-80`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}

/* ── Read-only field for view mode ─────────────────────── */

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
