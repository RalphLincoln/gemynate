import { useRef } from 'react';

export interface Plan {
    id: string;
    name: string;
    color: string;
    hospitalCash: string;
    accidentCompensation: string;
    familySupport: string;
    savings: string;
    weeklyAmount: string;
}

interface PlanCarouselProps {
    plans: Plan[];
    onSelectPlan: (planId: string) => void;
}

export function PlanCarousel({ plans, onSelectPlan }: PlanCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={scrollRef}
            className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
            style={{
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
                display: 'flex',
                gap: '12px',
                paddingLeft: '18px',
                paddingRight: '12px',
            }}
        >
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className="flex-shrink-0 snap-start"
                    style={{ width: '280px' }}
                >
                    <PlanCard plan={plan} onSelect={onSelectPlan} />
                </div>
            ))}
        </div>
    );
}

interface PlanCardProps {
    plan: Plan;
    onSelect: (planId: string) => void;
}

function PlanCard({ plan, onSelect }: PlanCardProps) {
    return (
        <div
            className="rounded-[16px] border-2 flex flex-col gap-[16px] bg-white"
            style={{ borderColor: plan.color }}
        >
            {/* Header */}
            <div
                className="rounded-t-[12px] px-[16px] py-[12px] text-white"
                style={{ backgroundColor: plan.color }}
            >
                <h3 className="text-[16px] font-semibold">{plan.name}</h3>
            </div>

            {/* Content */}
            <div className="space-y-[14px] px-[15px]">
                {/* Hospital Cash */}
                <div>
                    <div className="text-[13px] text-[#888] font-medium mb-[4px]">
                        If admitted to hospital
                    </div>
                    <div
                        className="text-[16px] font-semibold"
                        style={{ color: plan.color }}
                    >
                        {plan.hospitalCash}/night
                    </div>
                </div>

                {/* Accident Compensation */}
                <div>
                    <div className="text-[13px] text-[#888] font-medium mb-[4px]">
                        If accident stops you working
                    </div>
                    <div
                        className="text-[16px] font-semibold"
                        style={{ color: plan.color }}
                    >
                        {plan.accidentCompensation} paid
                    </div>
                </div>

                {/* Family Support */}
                <div>
                    <div className="text-[13px] text-[#888] font-medium mb-[4px]">
                        Family support
                    </div>
                    <div
                        className="text-[16px] font-semibold"
                        style={{ color: plan.color }}
                    >
                        {plan.familySupport}
                    </div>
                </div>

                {/* Savings Info */}
                <div className="border-y py-1">
                    <div className="text-[12px] leading-[18px] text-gray-400">
                        You also build
                    </div>
                    <div className="text-[15px] font-semibold mt-[2px] text-gray-800">
                        {plan.savings} toward your goal
                    </div>
                    <div className="text-[12px] mt-[4px] text-gray-400">
                        Save {plan.weeklyAmount}/week
                    </div>
                </div>
            </div>

            {/* Choose Button */}
            <button
                onClick={() => onSelect(plan.id)}
                className="w-full py-[12px] rounded-[12px] font-semibold text-[14px] transition-colors active:opacity-80"
                style={{
                    color: plan.color,
                    borderBottom: `2px solid ${plan.color}`,
                }}
            >
                Choose this plan
            </button>
        </div>
    );
}
