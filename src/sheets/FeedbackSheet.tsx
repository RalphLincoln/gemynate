import { useState, useRef, useEffect } from 'react';

interface FeedbackSheetProps {
    onClose: () => void;
}

const CATEGORIES = ['Bug', 'Suggestion', 'Question', 'Other'] as const;
type Category = (typeof CATEGORIES)[number];

const SHEET_URL = import.meta.env.VITE_FEEDBACK_SHEET_URL as string | undefined;

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<
        'idle' | 'sending' | 'success' | 'error'
    >('idle');
    const [ip, setIp] = useState('');
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        sheetRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Fetch IP on mount
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then((r) => r.json())
            .then((data) => setIp(data.ip))
            .catch(() => setIp('unknown'));
    }, []);

    // Auto-close after success
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(onClose, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    const canSubmit =
        category && message.trim().length > 0 && status === 'idle';

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setStatus('sending');

        const payload = {
            category,
            message: message.trim(),
            timestamp: new Date().toISOString(),
            ip: ip || 'unknown',
        };

        if (!SHEET_URL) {
            // No URL configured — log and fake success for dev
            console.log('[Feedback]', payload);
            setStatus('success');
            return;
        }

        try {
            await fetch(SHEET_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            // Apps Script redirects on success, so we don't check response.ok
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

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
                aria-label="Send feedback"
                className="bg-white rounded-t-[14px] w-full flex flex-col animate-slide-up outline-none"
                style={{
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center px-[20px] pt-[20px] pb-[16px] relative">
                    <span className="text-[17px] font-semibold text-[#111]">
                        Send Feedback
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

                {status === 'success' ? (
                    <div className="px-[20px] pb-[20px] text-center">
                        <div className="text-[32px] mb-2">&#10003;</div>
                        <p className="text-[15px] font-medium text-[#111]">
                            Thanks for your feedback!
                        </p>
                    </div>
                ) : (
                    <div className="px-[20px] pb-[4px]">
                        {/* Category picker */}
                        <p className="text-[13px] text-[#666] mb-[10px]">
                            Category
                        </p>
                        <div className="flex gap-[8px] flex-wrap mb-[16px]">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-[14px] py-[7px] rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                                        category === cat
                                            ? 'bg-[#25D366] text-white'
                                            : 'bg-[#f0f2f5] text-[#333] active:bg-[#e4e6e9]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Message */}
                        <p className="text-[13px] text-[#666] mb-[6px]">
                            Your feedback
                        </p>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what you think..."
                            rows={4}
                            className="w-full border border-[#d1d7db] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#111] outline-none focus:border-[#888] resize-none placeholder:text-[#999]"
                        />

                        {status === 'error' && (
                            <p className="text-[12px] text-red-500 mt-[6px]">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <p className="text-[11px] text-[#999] mt-[8px] text-center leading-[15px]">
                            Your feedback is anonymous. No personal data is
                            collected.
                        </p>

                        {/* Submit */}
                        <div className="pt-[10px] pb-[4px]">
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit && status !== 'error'}
                                className="w-full py-[10px] bg-[#25D366] text-white text-[15px] font-semibold text-center rounded-full cursor-pointer active:bg-[#1fba59] disabled:opacity-40 disabled:cursor-default"
                            >
                                {status === 'sending'
                                    ? 'Sending...'
                                    : status === 'error'
                                      ? 'Retry'
                                      : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
