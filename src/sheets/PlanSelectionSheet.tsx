import { useState } from 'react';
import type { PlanTier } from '../types';

interface PlanSelectionSheetProps {
    onSubmit: (plan: PlanTier) => void;
    onClose: () => void;
}

const plans: { id: PlanTier; name: string; desc: string }[] = [
    { id: 'ruby', name: 'Ruby Plan', desc: '\u20A6250/day \u2014 Basic cover' },
    {
        id: 'emerald',
        name: 'Emerald Plan',
        desc: '\u20A6500/day \u2014 Most popular',
    },
    {
        id: 'sapphire',
        name: 'Sapphire Plan',
        desc: '\u20A61,000/day \u2014 Premium cover',
    },
];

export function PlanSelectionSheet({
    onSubmit,
    onClose,
}: PlanSelectionSheetProps) {
    const [selected, setSelected] = useState<PlanTier | null>(null);

    return (
        <div
            className="absolute inset-0 bg-black/35 flex items-end z-50 animate-backdrop-fade"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white rounded-t-[14px] w-full max-h-[70%] flex flex-col animate-slide-up"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header with title and close */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        Select a Plan
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

                {/* Options list */}
                <div className="flex-1 overflow-y-auto">
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelected(plan.id)}
                            className="flex items-center justify-between w-full text-left px-[20px] py-[18px] border-b border-[#f0f0f0] last:border-b-0 cursor-pointer active:bg-[#f8f8f8]"
                        >
                            <div>
                                <div className="text-[13px] text-[#111]">
                                    {plan.name}
                                </div>
                                <div className="text-[11px] text-[#888] mt-[2px]">
                                    {plan.desc}
                                </div>
                            </div>
                            {selected === plan.id && (
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                    <path
                                        d="M4 10l4 4 8-8"
                                        stroke="#25D366"
                                        strokeWidth="2.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>

                {/* Send button - only shows when selected */}
                {selected && (
                    <div className="px-[20px] pt-[16px]">
                        <button
                            onClick={() => onSubmit(selected)}
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
