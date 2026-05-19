export function InputBar() {
    return (
        <div className="bg-[#f0f2f5] border-t-[0.5px] border-[#d1d7db] py-[6px] px-[6px] pb-[6px] flex items-end gap-[6px]">
            {/* Plus button (decorative) */}
            <button
                className="w-[34px] h-[34px] flex items-center justify-center flex-shrink-0 opacity-60 pointer-events-none"
                aria-hidden="true"
            >
                <svg width="26" height="26" viewBox="0 0 24 24">
                    <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="#54656f"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="#54656f"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            {/* Input field (non-interactive placeholder) */}
            <div className="flex-1 bg-white rounded-[21px] border-[0.5px] border-[#d1d7db] px-[12px] py-[8px] flex items-center min-h-[36px]">
                <span className="flex-1 text-[#8696a0] text-[15px] select-none">
                    Tap a button to respond
                </span>
                {/* Sticker icon inside field */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="flex-shrink-0 ml-[4px] opacity-60"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#8696a0"
                        strokeWidth="1.5"
                        fill="none"
                    />
                    <circle cx="8.5" cy="10" r="1.3" fill="#8696a0" />
                    <circle cx="15.5" cy="10" r="1.3" fill="#8696a0" />
                    <path
                        d="M7.5 14.5c1.5 2.5 7.5 2.5 9 0"
                        stroke="#8696a0"
                        strokeWidth="1.3"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Camera icon (decorative) */}
            <button
                className="w-[34px] h-[34px] flex items-center justify-center flex-shrink-0 opacity-60 pointer-events-none"
                aria-hidden="true"
            >
                <svg width="24" height="20" viewBox="0 0 24 20">
                    <path
                        d="M2 5h3.5L7.5 2h9l2 3H22v13H2z"
                        stroke="#54656f"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinejoin="round"
                    />
                    <circle
                        cx="12"
                        cy="11.5"
                        r="4"
                        stroke="#54656f"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </svg>
            </button>

            {/* Mic button (decorative) */}
            <div
                className="w-[36px] h-[36px] bg-[#54656f] rounded-full flex items-center justify-center flex-shrink-0 opacity-60 pointer-events-none"
                aria-hidden="true"
            >
                <svg width="14" height="20" viewBox="0 0 16 22">
                    <rect
                        x="5"
                        y="1"
                        width="6"
                        height="11"
                        rx="3"
                        stroke="#fff"
                        strokeWidth="1.5"
                        fill="none"
                    />
                    <path
                        d="M2 10a6 6 0 0012 0"
                        stroke="#fff"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <line
                        x1="8"
                        y1="16"
                        x2="8"
                        y2="20"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <line
                        x1="5"
                        y1="20"
                        x2="11"
                        y2="20"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    );
}
