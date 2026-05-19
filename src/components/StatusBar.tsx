export function StatusBar() {
    return (
        <div className="flex justify-between items-center px-[34px] pt-[14px] pb-[4px] bg-[#f0f2f5] text-[16px] font-semibold text-[#1a1a1a]">
            <div className="flex items-center gap-[2px]">
                <span>4:49</span>
                {/* Location arrow */}
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    className="ml-[1px]"
                >
                    <path d="M10.5 1.5L5 11l-1-4.5L0 5.5z" fill="#1a1a1a" />
                </svg>
            </div>
            <div className="flex items-center gap-[5px]">
                {/* Signal bars */}
                <svg width="17" height="12" viewBox="0 0 20 14">
                    <rect
                        x="0"
                        y="10"
                        width="3.5"
                        height="4"
                        rx="0.5"
                        fill="#1a1a1a"
                    />
                    <rect
                        x="5"
                        y="7"
                        width="3.5"
                        height="7"
                        rx="0.5"
                        fill="#1a1a1a"
                    />
                    <rect
                        x="10"
                        y="3"
                        width="3.5"
                        height="11"
                        rx="0.5"
                        fill="#1a1a1a"
                    />
                    <rect
                        x="15"
                        y="0"
                        width="3.5"
                        height="14"
                        rx="0.5"
                        fill="#c7c7c7"
                    />
                </svg>
                {/* WiFi */}
                <svg width="16" height="12" viewBox="0 0 16 12">
                    <path
                        d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
                        fill="#1a1a1a"
                    />
                    <path
                        d="M4.5 8.5a5 5 0 017 0"
                        stroke="#1a1a1a"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M1.5 5.5a9 9 0 0113 0"
                        stroke="#1a1a1a"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Battery */}
                <svg width="27" height="13" viewBox="0 0 28 14">
                    <rect
                        x="0"
                        y="1"
                        width="23"
                        height="12"
                        rx="3"
                        stroke="#1a1a1a"
                        strokeWidth="1"
                        fill="none"
                    />
                    <rect
                        x="2"
                        y="3"
                        width="11"
                        height="8"
                        rx="1.5"
                        fill="#1a1a1a"
                    />
                    <rect
                        x="24"
                        y="4.5"
                        width="2.5"
                        height="5"
                        rx="1"
                        fill="#1a1a1a"
                        opacity="0.4"
                    />
                </svg>
            </div>
        </div>
    );
}
