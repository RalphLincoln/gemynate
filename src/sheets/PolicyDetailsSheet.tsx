import { useState, useRef, useEffect } from 'react';
import type { PlanTier } from '../types';
import { PLAN_BENEFITS_V2, PLAN_COLORS } from '../data/flow-v2';

interface PolicyDetailsSheetProps {
    selectedPlan: PlanTier | null;
    onClose: () => void;
}

export function PolicyDetailsSheet({
    selectedPlan,
    onClose,
}: PolicyDetailsSheetProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const planColor = selectedPlan ? PLAN_COLORS[selectedPlan] : '#E53935';

    const benefits = selectedPlan ? PLAN_BENEFITS_V2[selectedPlan] : null;
    const planLabel =
        selectedPlan === 'ruby'
            ? 'Ruby'
            : selectedPlan === 'emerald'
              ? 'Emerald'
              : 'Sapphire';
    const policyNumber = `GEM-2026-${planLabel.toUpperCase().slice(0, 3)}-004821`;
    const familySupport = benefits?.familySupport || 200000;

    const steps = [
        {
            title: 'WHAT WE COVER',
            content: (
                <div className="space-y-4 text-gray-600">
                    <div className="text-[13px] mb-1.5">
                        <b>Accident Support:</b> Medical expenses from an
                        accident covered once a year.
                    </div>

                    <div className="text-[13px]  mb-1.5">
                        <b>Permanent Injury:</b> A payout up to ₦
                        {familySupport.toLocaleString()} if a severe accident
                        stops you from ever working again.
                    </div>

                    <div className="text-[13px] mb-1.5">
                        <b>Next of Kin Support:</b> Up to ₦
                        {familySupport.toLocaleString()} plus all your saved
                        money paid to your family if the worst happens.
                    </div>

                    <div className="py-3 mt-3">
                        <div
                            className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                            style={{ color: planColor }}
                        >
                            Cover Starts
                        </div>
                        <div className="text-[13px] text-[#111]">
                            30 days after you complete your first monthly
                            contribution goal
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'WHAT IS NOT COVERED',
            content: (
                <div className="space-y-3">
                    <ul className="space-y-1">
                        {[
                            'Pre-existing conditions',
                            'Pregnancy and maternity',
                            'Cosmetic procedures',
                            'Self-inflicted injuries',
                        ].map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 text-[13px] text-[#555]"
                            >
                                <span
                                    className="font-bold"
                                    style={{ color: planColor }}
                                >
                                    •
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ),
        },
        {
            title: 'HOW TO MAKE A CLAIM',
            content: (
                <div className="space-y-4">
                    {[
                        {
                            num: '1',
                            title: 'Open Your Chat',
                            desc: 'Open your Gemynate chat and tap "Claim from BackUp"',
                        },
                        {
                            num: '2',
                            title: 'Select Event',
                            desc: 'Choose the type: hospital admission or accidental injury',
                        },
                        {
                            num: '3',
                            title: 'Upload Documents',
                            desc: 'Upload proof and follow the steps. Takes under 5 minutes.',
                        },
                        {
                            num: '4',
                            title: 'We Review',
                            desc: 'We review and respond within 24 hours, right here in chat.',
                        },
                    ].map((step) => (
                        <div key={step.num} className="flex gap-3">
                            <div
                                className="flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold flex-shrink-0 mt-1"
                                style={{ backgroundColor: planColor }}
                            >
                                {step.num}
                            </div>
                            <div>
                                <div className="font-semibold text-[13px] text-[#111]">
                                    {step.title}
                                </div>
                                <div className="text-[12px] text-[#666] mt-0.5">
                                    {step.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    const step = steps[currentStep];

    const handleDoneClick = () => {
        onClose();

        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gemynate:goToDashboard'));
        }, 100);
    };

    const handleNextClick = () => {
        setCurrentStep(currentStep + 1);
    };

    const handleBackClick = () => {
        setCurrentStep(Math.max(0, currentStep - 1));
    };

    const isLastStep = currentStep === steps.length - 1;

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
                aria-label="Insurance BackUp Policy"
                className="bg-white rounded-t-[14px] w-full max-h-[85dvh] flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header - Dynamic color based on selected plan */}
                <div
                    className="text-white px-[20px] pt-[20px] pb-[16px] rounded-t-[14px]"
                    style={{ backgroundColor: planColor }}
                >
                    <div className="flex items-start justify-between">
                        <div className="text-[15px] font-semibold">
                            Here is your {planLabel} BackUp Policy
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer active:opacity-60 flex-shrink-0 mt-1"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14">
                                <path
                                    d="M1 1l12 12M13 1L1 13"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-y-auto px-[20px] py-[20px]"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    <div className="">
                        <div
                            className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                            style={{ color: planColor }}
                        >
                            {step.title}
                        </div>
                        {step.content}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-[20px] py-[16px] shrink-0 sticky bottom-0 bg-white border-t border-[#e0e0e0]">
                    {/* Back and Next/Done buttons */}
                    <div className="flex gap-3">
                        {/* Back Button */}
                        <button
                            onClick={handleBackClick}
                            disabled={currentStep === 0}
                            className={`flex-1 py-[10px] rounded-full text-[15px] font-semibold text-center border border-[#d0d0d0] cursor-pointer transition-colors ${
                                currentStep === 0
                                    ? 'bg-[#f5f5f5] text-[#999] opacity-50'
                                    : 'bg-white text-[#333] active:bg-[#f5f5f5]'
                            }`}
                        >
                            Back
                        </button>

                        {/* Next/Done Button - Changes based on current step */}
                        {isLastStep ? (
                            <button
                                onClick={handleDoneClick}
                                className="flex-1 py-[10px] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:opacity-80"
                                style={{ backgroundColor: planColor }}
                            >
                                Done
                            </button>
                        ) : (
                            <button
                                onClick={handleNextClick}
                                className="flex-1 py-[10px] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:opacity-80"
                                style={{ backgroundColor: planColor }}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
