import { useState, useEffect, useRef } from 'react';

interface ClaimNightsSheetProps {
    onSubmit: (nights: number) => void;
    onClose: () => void;
    title?: string;
    subtitle?: string;
}

export function ClaimNightsSheet({
    onSubmit,
    onClose,
    title = 'Total Nights',
    subtitle = 'How many nights were you admitted?',
}: ClaimNightsSheetProps) {
    const [nights, setNights] = useState(2);
    const [directInput, setDirectInput] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

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
                aria-label={title}
                className="bg-white rounded-t-[14px] w-full flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        {title}
                    </span>
                    <button
                        onClick={onClose}
                        className="absolute right-[20px] cursor-pointer active:opacity-60"
                    >
                        <svg width="16" height="16" viewBox="0 0 14 14">
                            <path
                                d="M1 1l12 12M13 1L1 13"
                                stroke="#666"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="px-[20px] pb-4">
                    <p className="text-[13px] text-[#666] text-center mb-6">
                        {subtitle}
                    </p>

                    {/* Counter */}
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={() => setNights((n) => Math.max(1, n - 1))}
                            disabled={nights <= 1}
                            className="w-[48px] h-[48px] rounded-full border-2 border-[#d0d0d0] flex items-center justify-center cursor-pointer active:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-default"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                            >
                                <path
                                    d="M4 9h10"
                                    stroke="#333"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>

                        <span className="text-[40px] font-bold text-[#111] w-[60px] text-center tabular-nums">
                            {nights}
                        </span>

                        <button
                            onClick={() =>
                                setNights((n) => Math.min(30, n + 1))
                            }
                            disabled={nights >= 30}
                            className="w-[48px] h-[48px] rounded-full border-2 border-[#d0d0d0] flex items-center justify-center cursor-pointer active:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-default"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                            >
                                <path
                                    d="M9 4v10M4 9h10"
                                    stroke="#333"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>

                    {!directInput && (
                        <button
                            onClick={() => setDirectInput(true)}
                            className="text-[12px] text-[#0077b6] text-center mt-3 cursor-pointer active:opacity-70 block mx-auto"
                        >
                            Type a number instead
                        </button>
                    )}
                    {directInput && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                autoFocus
                                value={String(nights)}
                                onChange={(e) => {
                                    const val =
                                        parseInt(
                                            e.target.value.replace(/\D/g, '')
                                        ) || 1;
                                    setNights(Math.max(1, Math.min(30, val)));
                                }}
                                className="w-[60px] text-center text-[18px] font-semibold border border-[#d0d0d0] rounded-lg py-1.5 outline-none focus:border-[#888]"
                            />
                            <span className="text-[13px] text-[#666]">
                                nights
                            </span>
                        </div>
                    )}
                    <p className="text-[11px] text-[#767676] text-center mt-2">
                        Min 1 — Max 30
                    </p>
                </div>

                <div className="px-[20px] pt-[4px] pb-[4px] shrink-0">
                    <button
                        onClick={() => onSubmit(nights)}
                        className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59]"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
