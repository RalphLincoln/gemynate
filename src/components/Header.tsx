interface HeaderProps {
    onReset: () => void;
    onFeedback?: () => void;
}

export function Header({ onReset, onFeedback }: HeaderProps) {
    return (
        <div className="bg-[#f0f2f5] border-b-[0.5px] border-[#d1d7db] py-[6px] pb-[8px] px-[14px] flex items-center gap-[6px]">
            {/* Back arrow */}
            <div className="flex items-center">
                <svg width="11" height="19" viewBox="0 0 12 20">
                    <path
                        d="M10 2L3 10l7 8"
                        stroke="#007AFF"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* Avatar */}
            <div className="w-[40px] h-[40px] rounded-full bg-[#ccc] flex items-center justify-center font-bold text-[16px] text-white flex-shrink-0">
                G
            </div>

            {/* Name & subtitle */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-[16.5px] text-[#111] leading-[20px] truncate">
                    Gemynate
                </div>
                <div className="text-[13px] text-[#667781] leading-[16px]">
                    Business account
                </div>
            </div>

            {/* Feedback button */}
            {onFeedback && (
                <button
                    onClick={onFeedback}
                    title="Send feedback"
                    className="cursor-pointer p-[7px] rounded-[8px] bg-[#e4e6e9] active:bg-[#d1d3d6] flex items-center justify-center"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            stroke="#54656f"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}

            {/* Reset button */}
            <button
                onClick={onReset}
                title="Reset conversation"
                className="cursor-pointer px-[12px] py-[6px] rounded-[8px] bg-[#e4e6e9] active:bg-[#d1d3d6] text-[13px] font-medium text-[#54656f] flex items-center gap-[4px]"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2 2v5h5"
                        stroke="#54656f"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M3.05 10A6 6 0 1 0 4 4L2 7"
                        stroke="#54656f"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Reset
            </button>
        </div>
    );
}
