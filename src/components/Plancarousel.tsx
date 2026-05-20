import { useRef } from 'react';

export interface Plan {
    id: string;
    name: string;
    color: string;
    savingsGoal: string;
    medicalCoverage: string;
    nextOfKin: string;
    contribution: string;
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
                    style={{ width: '260px' }}
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
            className="rounded-[16px] border-2 flex flex-col bg-white overflow-hidden"
            style={{ borderColor: plan.color }}
        >
            {/* Header */}
            <div
                className="px-[16px] py-[12px] text-white"
                style={{ backgroundColor: plan.color }}
            >
                <h3 className="text-[15px] font-semibold">{plan.name}</h3>
            </div>

            {/* Content */}
            <div className="px-[16px] py-[14px] space-y-[12px] flex-1">
                {/* Savings Goal */}
                <div className="flex items-start gap-[8px]">
                    <span className="text-[14px] mt-[1px]">💰</span>
                    <p className="text-[13px] leading-[18px] text-gray-700">
                        Build{' '}
                        <span className="font-semibold">
                            {plan.savingsGoal}
                        </span>{' '}
                        toward your goal
                    </p>
                </div>

                {/* Medical Coverage */}
                <div className="flex items-start gap-[8px]">
                    <span className="text-[14px] mt-[1px]">🏥</span>
                    <p className="text-[13px] leading-[18px] text-gray-700">
                        {plan.medicalCoverage}
                    </p>
                </div>

                {/* Next of Kin */}
                <div className="flex items-start gap-[8px]">
                    <span className="text-[14px] mt-[1px]">👨‍👩‍👧</span>
                    <p className="text-[13px] leading-[18px] text-gray-700">
                        Next of kin support:{' '}
                        <span className="font-semibold">{plan.nextOfKin}</span>{' '}
                        + your savings
                    </p>
                </div>

                {/* Contribution */}
                <div className="flex items-start gap-[8px]">
                    <span className="text-[14px] mt-[1px]">📅</span>
                    <p className="text-[13px] leading-[18px] text-gray-700">
                        {plan.contribution}
                    </p>
                </div>
            </div>

            {/* Choose Button */}
            <div className="px-[16px] pb-[14px]">
                <button
                    onClick={() => onSelect(plan.id)}
                    className="w-full py-[10px] rounded-[10px] font-semibold text-[13px] transition-colors active:opacity-80 text-white"
                    style={{ backgroundColor: plan.color }}
                >
                    Choose this plan
                </button>
            </div>
        </div>
    );
}
