import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, SheetType } from '../types';

interface MessageBubbleProps {
    message: Message;
    isFirst?: boolean;
    onViewResponse?: (sheet: SheetType) => void;
    onCtaClick?: (action: string) => void;
    onQuickReply?: (label: string, action: string) => void;
    onClaimAction?: (claimAction: string, msgId: string) => void;
}

const ReplyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path
            d="M8 5L3 10L8 15"
            stroke="#0077b6"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M3 10H13C15.2091 10 17 11.7909 17 14V15"
            stroke="#0077b6"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ListIcon = () => (
    <svg width="18" height="15" viewBox="0 0 20 16" fill="none">
        <line
            x1="6"
            y1="3"
            x2="18"
            y2="3"
            stroke="#0077b6"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <line
            x1="6"
            y1="8"
            x2="18"
            y2="8"
            stroke="#0077b6"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <line
            x1="6"
            y1="13"
            x2="18"
            y2="13"
            stroke="#0077b6"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <circle cx="2" cy="3" r="1.3" fill="#0077b6" />
        <circle cx="2" cy="8" r="1.3" fill="#0077b6" />
        <circle cx="2" cy="13" r="1.3" fill="#0077b6" />
    </svg>
);

const ChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
            d="M5 2.5L9.5 7L5 11.5"
            stroke="#8c8c8c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

function formatText(text: string) {
    // Parse WhatsApp-style *bold* markers into <strong> elements
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(1, -1)}
                </strong>
            );
        }
        return part;
    });
}

// --- Voice Note Player ---

const WAVEFORM_BARS = [
    0.3, 0.5, 0.35, 0.6, 0.75, 0.5, 0.4, 0.7, 0.85, 0.45, 0.35, 0.65, 0.95, 0.7,
    0.45, 0.55, 0.8, 0.55, 0.4, 0.75, 0.5, 0.3, 0.6, 0.85, 0.55, 0.35, 0.7,
    0.95, 0.6, 0.4, 0.55, 0.8, 0.35, 0.65, 0.9, 0.5, 0.3, 0.75, 0.55, 0.45, 0.7,
    0.85, 0.4, 0.6, 0.75, 0.35, 0.5, 0.65,
];

function VoiceNotePlayer({
    duration,
    timestamp,
    audioSrc,
}: {
    duration: number;
    timestamp: string;
    audioSrc?: string;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);
    const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
    const intervalRef = useRef<number | null>(null);
    const waveformRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressRef = useRef(progress);
    progressRef.current = progress;

    // Initialize audio element
    useEffect(() => {
        if (!audioSrc) return;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            window.dispatchEvent(
                new CustomEvent('gemynate:voicePlayed', {
                    detail: { audioSrc },
                })
            );
        };
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.pause();
            audio.removeEventListener('ended', onEnded);
            audioRef.current = null;
        };
    }, [audioSrc]);

    // Sync playback rate
    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
    }, [speed]);

    // Playback effect — real audio or simulated
    useEffect(() => {
        const audio = audioRef.current;
        let onTime: (() => void) | null = null;

        if (audio && audioSrc) {
            if (isPlaying && !isDragging) {
                audio.play().catch(() => {});
                onTime = () => {
                    if (audio.duration)
                        setProgress(audio.currentTime / audio.duration);
                };
                audio.addEventListener('timeupdate', onTime);
            } else {
                audio.pause();
            }
        } else if (!audioSrc) {
            if (isPlaying && !isDragging) {
                const step = (1 / (duration * 30)) * speed;
                intervalRef.current = window.setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 1) {
                            setIsPlaying(false);
                            return 0;
                        }
                        return Math.min(prev + step, 1);
                    });
                }, 1000 / 30);
            } else if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (onTime && audio)
                audio.removeEventListener('timeupdate', onTime);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, isDragging, duration, speed, audioSrc]);

    const cycleSpeed = useCallback(() => {
        setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1));
    }, []);

    const togglePlay = useCallback(() => {
        if (progressRef.current >= 1) {
            setProgress(0);
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
        setIsPlaying((p) => !p);
    }, []);

    // Convert a clientX position to a 0–1 progress value
    const clientXToProgress = useCallback((clientX: number) => {
        const el = waveformRef.current;
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    }, []);

    // Tap anywhere on waveform to seek
    const handleWaveformClick = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (isDragging) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const p = clientXToProgress(clientX);
            setProgress(p);
            if (audioRef.current && audioRef.current.duration)
                audioRef.current.currentTime = p * audioRef.current.duration;
        },
        [clientXToProgress, isDragging]
    );

    // Drag start (mouse + touch)
    const handleDragStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging(true);
            setWasPlayingBeforeDrag(isPlaying);
            setIsPlaying(false);

            const onMove = (ev: MouseEvent | TouchEvent) => {
                const clientX =
                    'touches' in ev ? ev.touches[0].clientX : ev.clientX;
                const p = clientXToProgress(clientX);
                setProgress(p);
                if (audioRef.current && audioRef.current.duration)
                    audioRef.current.currentTime =
                        p * audioRef.current.duration;
            };

            const onEnd = () => {
                setIsDragging(false);
                setWasPlayingBeforeDrag((prev) => {
                    // Resume playback if it was playing before drag
                    if (prev) setIsPlaying(true);
                    return false;
                });
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        },
        [isPlaying, clientXToProgress]
    );

    const elapsed = Math.floor(progress * duration);
    const displayTime =
        isPlaying || progress > 0
            ? `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`
            : `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;

    return (
        <div className="flex flex-col gap-[4px]">
            {/* Top row: play icon + waveform + avatar */}
            <div className="flex items-center gap-[12px]">
                {/* Play / Pause icon — no background circle */}
                <button
                    onClick={togglePlay}
                    className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-60 transition-opacity p-[2px]"
                    aria-label={
                        isPlaying ? 'Pause voice note' : 'Play voice note'
                    }
                >
                    {isPlaying ? (
                        <svg
                            width="16"
                            height="18"
                            viewBox="0 0 16 18"
                            fill="#3b3b3b"
                        >
                            <rect x="2" y="1" width="4" height="16" rx="1.5" />
                            <rect x="10" y="1" width="4" height="16" rx="1.5" />
                        </svg>
                    ) : (
                        <svg
                            width="16"
                            height="18"
                            viewBox="0 0 16 18"
                            fill="#3b3b3b"
                        >
                            <path d="M2 1.5L14.5 9L2 16.5V1.5Z" />
                        </svg>
                    )}
                </button>

                {/* Waveform with scrubber */}
                <div
                    className="flex-1 relative h-[30px] flex items-center min-w-0 cursor-pointer"
                    ref={waveformRef}
                    onClick={handleWaveformClick}
                >
                    <div className="flex items-center gap-[1.5px] w-full overflow-hidden pointer-events-none">
                        {WAVEFORM_BARS.map((h, i) => {
                            const barPos = i / WAVEFORM_BARS.length;
                            const played = barPos < progress;
                            return (
                                <div
                                    key={i}
                                    className="rounded-full"
                                    style={{
                                        minWidth: '2px',
                                        width: '2px',
                                        height: `${h * 22 + 4}px`,
                                        backgroundColor: played
                                            ? '#5a5a5a'
                                            : '#c8c8c8',
                                        transition:
                                            'background-color 0.15s ease',
                                    }}
                                />
                            );
                        })}
                    </div>
                    {/* Blue scrubber dot — draggable */}
                    <div
                        className="absolute w-[13px] h-[13px] rounded-full bg-[#34B7F1] shadow-sm cursor-grab active:cursor-grabbing touch-none"
                        style={{
                            left: `calc(${progress * 100}% - ${progress * 13}px)`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            transition: isDragging
                                ? 'none'
                                : isPlaying
                                  ? 'none'
                                  : 'left 0.15s ease',
                            zIndex: 2,
                        }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    />
                </div>

                {/* Right: avatar (idle) or speed button (playing/progressed) */}
                <div className="flex-shrink-0">
                    {isPlaying || progress > 0 ? (
                        <button
                            onClick={cycleSpeed}
                            className="w-[32px] h-[22px] rounded-[6px] bg-[#3b3b3b] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                            aria-label={`Playback speed ${speed}x`}
                        >
                            <span className="text-[#e4e4e4] text-[10px] font-semibold leading-none whitespace-nowrap">
                                {speed}x
                            </span>
                        </button>
                    ) : (
                        <div className="relative">
                            <div className="w-[28px] h-[28px] rounded-full bg-[#25D366] flex items-center justify-center">
                                <span className="text-white text-[11px] font-bold leading-none">
                                    G
                                </span>
                            </div>
                            {/* Mic badge */}
                            <div className="absolute -bottom-[2px] -left-[4px] w-[14px] h-[14px] rounded-full bg-[#34B7F1] flex items-center justify-center">
                                <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 10 12"
                                    fill="white"
                                >
                                    <rect
                                        x="3"
                                        y="0"
                                        width="4"
                                        height="7"
                                        rx="2"
                                    />
                                    <path
                                        d="M1 5.5C1 7.5 3 9 5 9C7 9 9 7.5 9 5.5"
                                        stroke="white"
                                        strokeWidth="1.2"
                                        fill="none"
                                    />
                                    <line
                                        x1="5"
                                        y1="9"
                                        x2="5"
                                        y2="11"
                                        stroke="white"
                                        strokeWidth="1.2"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom row: duration + timestamp — aligned under play+waveform only */}
            <div className="flex items-center justify-between pl-[28px] pr-[42px]">
                <span className="text-[11px] text-[#8c8c8c]">
                    {displayTime}
                </span>
                <span className="text-[11px] text-[#8c8c8c]">{timestamp}</span>
            </div>
        </div>
    );
}

export function MessageBubble({
    message,
    isFirst,
    onViewResponse,
    onCtaClick,
    onQuickReply,
    onClaimAction,
}: MessageBubbleProps) {
    const isBot = message.type === 'bot';
    const isSystem = message.type === 'system';
    const hasButtons =
        isBot &&
        !message.accountCard &&
        !message.dashboardCard &&
        (message.cta ||
            (message.quickReplies && message.quickReplies.length > 0) ||
            (message.menuItems && message.menuItems.length > 0));
    const hasCarousel =
        isBot && message.carousel && message.carousel.length > 0;
    const isVoiceNote = isBot && !!message.voiceNote;
    const skipTextBubble =
        (hasCarousel && !message.text) ||
        isVoiceNote ||
        (!message.text && !message.image && !message.locationCard);

    if (isSystem) {
        return (
            <div className="self-center bg-[#d1f4cc] text-[#3a3a3a] text-[12.5px] px-[14px] py-[6px] rounded-lg my-[2px] text-center max-w-[85%] leading-[1.45] shadow-[0_1px_0.5px_rgba(0,0,0,0.07)]">
                {message.text}
            </div>
        );
    }

    // Form response card (user side)
    if (message.formResponse) {
        return (
            <div
                className="max-w-[80%] relative animate-[fade-in_0.2s_ease-out] self-end"
                role="article"
                aria-label={`Your response at ${message.timestamp}`}
            >
                <div className="bg-[#303030] text-white rounded-lg rounded-tr-[3px] shadow-[0_1px_0.5px_rgba(0,0,0,0.2)] overflow-hidden">
                    {/* Card body */}
                    <div className="px-[12px] pt-[10px] pb-[8px] flex items-center gap-[10px]">
                        <div className="w-[36px] h-[36px] rounded-[8px] bg-[#4a4a4a] flex items-center justify-center flex-shrink-0">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <rect
                                    x="3"
                                    y="2"
                                    width="14"
                                    height="16"
                                    rx="2"
                                    stroke="#aaa"
                                    strokeWidth="1.5"
                                />
                                <line
                                    x1="7"
                                    y1="7"
                                    x2="13"
                                    y2="7"
                                    stroke="#aaa"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="7"
                                    y1="10"
                                    x2="13"
                                    y2="10"
                                    stroke="#aaa"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="7"
                                    y1="13"
                                    x2="10"
                                    y2="13"
                                    stroke="#aaa"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium truncate">
                                {message.formResponse.title}
                            </div>
                            <div className="text-[11px] text-[rgba(255,255,255,0.5)]">
                                Response sent
                            </div>
                        </div>
                        <span className="text-[11px] text-[rgba(255,255,255,0.55)] self-end ml-[4px] whitespace-nowrap">
                            {message.timestamp} {'\u2713\u2713'}
                        </span>
                    </div>
                    {/* View response button */}
                    <button
                        onClick={() =>
                            onViewResponse?.(message.formResponse!.sheet)
                        }
                        className="w-full border-t border-[rgba(255,255,255,0.15)] py-[8px] text-center text-[13px] text-[rgba(255,255,255,0.7)] cursor-pointer active:bg-[rgba(255,255,255,0.05)]"
                    >
                        View response
                    </button>
                </div>
            </div>
        );
    }

    // Action button (user-side CTA for claim steps)
    if (message.actionButton) {
        return (
            <div
                className="max-w-[80%] relative animate-[fade-in_0.2s_ease-out] self-end"
                role="article"
                aria-label={`Action: ${message.actionButton.label}`}
            >
                <button
                    onClick={() =>
                        onClaimAction?.(
                            message.actionButton!.claimAction,
                            message.id
                        )
                    }
                    aria-label={message.actionButton.label}
                    className="bg-[#303030] text-white rounded-lg rounded-tr-[3px] shadow-[0_1px_0.5px_rgba(0,0,0,0.2)] px-[16px] py-[10px] flex items-center gap-[8px] cursor-pointer active:bg-[#404040] transition-colors"
                >
                    <span className="text-[14.5px]">
                        {message.actionButton.label}
                    </span>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="opacity-50"
                        aria-hidden="true"
                    >
                        <path
                            d="M5 2.5L9.5 7L5 11.5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            role="article"
            aria-label={
                isBot
                    ? `Bot message at ${message.timestamp}`
                    : `Your message at ${message.timestamp}`
            }
            className={`max-w-[80%] relative animate-[fade-in_0.2s_ease-out] ${
                isBot ? 'self-start' : 'self-end'
            }`}
        >
            {/* Location card (user side) */}
            {!isBot && message.locationCard && (
                <div
                    className={`rounded-lg rounded-tr-[3px] overflow-hidden shadow-[0_1px_0.5px_rgba(0,0,0,0.2)] ${isFirst ? 'bubble-tail-right' : ''}`}
                >
                    {/* Map area */}
                    <div className="relative h-[130px] bg-[#e8dfd0] overflow-hidden">
                        {message.locationCard.lat &&
                        message.locationCard.lng ? (
                            <img
                                src={`https://tile.openstreetmap.org/${15}/${Math.floor(((message.locationCard.lng + 180) / 360) * Math.pow(2, 15))}/${Math.floor(((1 - Math.log(Math.tan((message.locationCard.lat * Math.PI) / 180) + 1 / Math.cos((message.locationCard.lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, 15))}.png`}
                                alt="Location map"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 260 130"
                                fill="none"
                            >
                                <rect width="260" height="130" fill="#e8dfd0" />
                                <path
                                    d="M0 40 Q65 35 130 45 T260 38"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                                <path
                                    d="M0 70 Q65 75 130 65 T260 72"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                                <path
                                    d="M0 100 Q65 95 130 105 T260 98"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                                <path
                                    d="M60 0 Q55 65 65 130"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                                <path
                                    d="M130 0 Q135 65 125 130"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                                <path
                                    d="M200 0 Q195 65 205 130"
                                    stroke="#d4c9b8"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                            </svg>
                        )}
                        {/* Pin */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-[28px] h-[28px] rounded-full bg-[#8b6b52] border-[3px] border-white shadow-md" />
                        </div>
                    </div>
                    {/* Bottom bar */}
                    <div className="bg-[#303030] px-[12px] py-[8px] flex items-center gap-[8px]">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <circle
                                cx="8"
                                cy="8"
                                r="6"
                                stroke="#25D366"
                                strokeWidth="1.5"
                            />
                            <circle cx="8" cy="8" r="2.5" fill="#25D366" />
                        </svg>
                        <span className="text-[13px] text-white flex-1">
                            {message.locationCard.label}
                        </span>
                        <span className="text-[11px] text-[rgba(255,255,255,0.55)] whitespace-nowrap">
                            {message.timestamp}
                            <span className="ml-[2px] tracking-[-1px] text-[#0077b6]">
                                {' \u2713\u2713'}
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* Image + text message (user side) */}
            {!isBot && message.image && !message.locationCard && (
                <div
                    className={`rounded-lg rounded-tr-[3px] overflow-hidden bg-[#303030] shadow-[0_1px_0.5px_rgba(0,0,0,0.2)] ${isFirst ? 'bubble-tail-right' : ''}`}
                >
                    <div className="relative">
                        <img
                            src={message.image}
                            alt=""
                            className="w-full max-w-full object-cover"
                        />
                        {message.uploading && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-3 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                                <span className="text-[13px] text-white font-medium">
                                    {message.text}
                                </span>
                            </div>
                        )}
                    </div>
                    {!message.uploading && (
                        <div className="px-[12px] pt-[6px] pb-[7px]">
                            <span className="text-[14.5px] text-white whitespace-pre-wrap">
                                {message.text}
                            </span>
                            <span className="text-[11px] float-right ml-[8px] leading-[18px] mt-[2px] text-[rgba(255,255,255,0.55)]">
                                {message.timestamp}
                                <span className="ml-[2px] tracking-[-1px] text-[#0077b6]">
                                    {' \u2713\u2713'}
                                </span>
                            </span>
                            <div className="clear-both" />
                        </div>
                    )}
                </div>
            )}

            {/* Voice note bubble */}
            {isVoiceNote && (
                <div
                    className={`w-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] overflow-hidden ${
                        hasButtons
                            ? 'rounded-t-lg rounded-tl-[3px]'
                            : 'rounded-lg rounded-tl-[3px]'
                    } ${isFirst ? 'bubble-tail-left' : ''}`}
                >
                    <div className="px-[10px] py-[8px]">
                        <VoiceNotePlayer
                            duration={message.voiceNote!.duration}
                            timestamp={message.timestamp}
                            audioSrc={message.voiceNote!.audioSrc}
                        />
                    </div>
                </div>
            )}

            {/* Regular message bubble (no image, no location card, no accountCard, no dashboardCard) */}
            {((!message.image &&
                !message.locationCard &&
                !message.accountCard &&
                !message.dashboardCard) ||
                isBot) &&
                !skipTextBubble && (
                    <div
                        className={`text-[14.5px] leading-[19px] break-words overflow-hidden ${
                            isBot
                                ? 'bg-white text-[#111] shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                                : 'bg-[#303030] text-white rounded-tr-[3px] shadow-[0_1px_0.5px_rgba(0,0,0,0.2)]'
                        } ${isBot && hasButtons ? 'rounded-t-lg rounded-tl-[3px]' : `rounded-lg ${isBot ? 'rounded-tl-[3px]' : 'rounded-tr-[3px]'}`} ${isFirst && isBot ? 'bubble-tail-left' : ''} ${isFirst && !isBot ? 'bubble-tail-right' : ''}`}
                    >
                        {/* Quoted reply */}
                        {message.replyTo && (
                            <div className="mx-[4px] mt-[4px] bg-[#474747] rounded-[8px] px-[10px] py-[6px] border-l-[3px] border-[#06cf9c]">
                                <div className="text-[12px] font-semibold text-[#06cf9c] mb-[2px]">
                                    Gemynate
                                </div>
                                <div className="text-[13px] text-[rgba(255,255,255,0.7)] line-clamp-2">
                                    {message.replyTo.text}
                                </div>
                            </div>
                        )}
                        <div className="px-[12px] pt-[8px] pb-[7px]">
                            <span className="whitespace-pre-wrap">
                                {formatText(message.text)}
                            </span>
                            <span
                                className={`text-[11px] float-right ml-[8px] leading-[18px] mt-[2px] ${
                                    isBot
                                        ? 'text-[#666]'
                                        : 'text-[rgba(255,255,255,0.55)]'
                                }`}
                            >
                                {message.timestamp}
                                {!isBot && (
                                    <span className="ml-[2px] tracking-[-1px] text-[rgba(255,255,255,0.55)]">
                                        {' \u2713\u2713'}
                                    </span>
                                )}
                            </span>
                            <div className="clear-both" />
                        </div>
                    </div>
                )}

            {/* Attached buttons */}
            {hasButtons && (
                <div className="bg-white rounded-b-lg shadow-[0_1px_2px_rgba(0,0,0,0.12)] overflow-hidden">
                    {message.cta && (
                        <button
                            onClick={() => onCtaClick?.(message.cta!.action)}
                            className="w-full border-t border-[#e0e0e0] px-[10px] py-[10px] text-center text-[14px] font-normal flex items-center justify-center gap-[6px] cursor-pointer active:bg-[#f5f5f5]"
                            style={{ color: message.color || '#0077b6' }}
                        >
                            <ListIcon />
                            {message.cta.label}
                        </button>
                    )}
                    {message.menuItems?.map((item) => (
                        <button
                            key={item.action + item.label}
                            onClick={() =>
                                onQuickReply?.(item.label, item.action)
                            }
                            className="w-full border-t border-[#e0e0e0] px-[14px] py-[11px] text-[#111] text-[14px] font-normal flex items-center justify-between cursor-pointer active:bg-[#f5f5f5]"
                        >
                            <span>{item.label}</span>
                            <ChevronRight />
                        </button>
                    ))}
                    {message.quickReplies?.map((reply) => (
                        <button
                            key={reply.action + reply.label}
                            onClick={() =>
                                onQuickReply?.(reply.label, reply.action)
                            }
                            className="w-full border-t border-[#e0e0e0] px-[10px] py-[10px] text-center text-[14px] font-normal flex items-center justify-center gap-[6px] cursor-pointer active:bg-[#f5f5f5]"
                            style={{ color: message.color || '#0077b6' }}
                        >
                            <ReplyIcon />
                            {reply.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Account Card with Dynamic Colors */}
            {isBot && message.accountCard && (
                <div className="w-full overflow-hidden text-[14.5px] leading-[19px]">
                    {/* Header - Uses plan color */}
                    <div
                        className="text-white px-[16px] py-[12px] rounded-t-lg"
                        style={{ backgroundColor: message.color || '#c74a3a' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-[14px] font-semibold leading-none">
                                Gemynate
                            </div>
                            <div className="text-[13px] font-medium opacity-90 leading-none">
                                {message.accountCard.planName}
                            </div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                        {/* Subheader */}
                        <div className="px-[16px] pt-[12px]">
                            <div className="text-[13px] text-[#8c8c8c] uppercase tracking-wide">
                                Your savings account
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-[16px] py-[14px] space-y-[14px]">
                            {/* Account Name */}
                            <div>
                                <div className="text-[11px] text-[#8c8c8c] uppercase tracking-wide">
                                    Account name
                                </div>
                                <div className="text-[14.5px] font-medium text-[#111]">
                                    {message.accountCard.accountName}
                                </div>
                            </div>

                            {/* Account Number */}
                            <div>
                                <div className="text-[11px] text-[#8c8c8c] uppercase tracking-wide">
                                    Account number
                                </div>
                                <div className="text-[16px] font-semibold text-[#111] tracking-wider">
                                    {message.accountCard.accountNumber}
                                </div>
                            </div>

                            {/* Bank */}
                            <div>
                                <div className="text-[11px] text-[#8c8c8c] uppercase tracking-wide">
                                    Bank
                                </div>
                                <div className="text-[14.5px] font-medium text-[#111]">
                                    {message.accountCard.bankName}
                                </div>
                            </div>

                            {/* Highlight - Uses plan color with 20% opacity background */}
                            <div
                                className="rounded-[8px] px-[12px] py-[10px]"
                                style={{
                                    backgroundColor: `${message.color || '#c74a3a'}20`,
                                }}
                            >
                                <div
                                    className="text-[11px] leading-[18px]"
                                    style={{
                                        color: message.color || '#c74a3a',
                                    }}
                                >
                                    Send {message.accountCard.weeklyAmount} this
                                    week to stay on track
                                </div>
                            </div>

                            {/* Payment methods */}
                            <div className="text-[12px] text-[#8c8c8c]">
                                Pay by{' '}
                                {message.accountCard.paymentMethods.join(', ')}
                            </div>
                        </div>

                        {/* Buttons - Uses plan color */}
                        {message.quickReplies &&
                            message.quickReplies.length > 0 && (
                                <div className="border-t border-[#e0e0e0]">
                                    {message.quickReplies.map((reply) => (
                                        <button
                                            key={reply.action + reply.label}
                                            onClick={() =>
                                                onQuickReply?.(
                                                    reply.label,
                                                    reply.action
                                                )
                                            }
                                            className="w-full border-t border-[#e0e0e0] px-[10px] py-[10px] text-center text-[14px] font-normal flex items-center justify-center gap-[6px] cursor-pointer active:bg-[#f5f5f5]"
                                            style={{
                                                color:
                                                    message.color || '#0077b6',
                                            }}
                                        >
                                            <ReplyIcon />
                                            {reply.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* Dashboard Card with Dynamic Colors */}
            {isBot && message.dashboardCard && (
                <div className="w-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] rounded-lg rounded-tl-[3px] overflow-hidden text-[14.5px] leading-[19px]">
                    <div className="px-[16px] py-[12px] space-y-[3px]">
                        {/* Header */}
                        <div className="text-[14px] font-semibold text-[#111] leading-[20px]">
                            Hi {message.dashboardCard.userName}
                        </div>

                        <div
                            className="rounded-[8px] px-[10px] py-[10px] space-y-[2px]"
                            style={{
                                backgroundColor: `${message.color || '#c74a3a'}15`,
                                borderLeft: `3px solid ${message.color || '#c74a3a'}`,
                            }}
                        >
                            <div
                                className="text-[12px] font-semibold"
                                style={{ color: message.color || '#c74a3a' }}
                            >
                                Your BackUp is live from{' '}
                                {message.dashboardCard.lockDate}
                            </div>
                            <div className="text-[12px] text-[#555] leading-[16px]">
                                Hospital cash, accident pay, and family support
                                are covering you.
                            </div>
                        </div>

                        {/* Plan Details */}
                        <div className="space-y-[10px]">
                            {/* Saved Amount and Goal */}
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-[2px]">
                                    <div className="text-[11px] text-[#999] font-medium">
                                        {message.dashboardCard.savedAmount.toLocaleString()}{' '}
                                        saved
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] text-[#999] font-medium">
                                        {message.dashboardCard.goalAmount.toLocaleString()}{' '}
                                        goal
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-[6px]">
                                <div className="w-full h-[6px] bg-[#e0e0e0] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${message.dashboardCard.progressPercent}%`,
                                            backgroundColor:
                                                message.color || '#c74a3a',
                                        }}
                                    />
                                </div>
                                <div className="text-[11px] text-[#8c8c8c]">
                                    {message.dashboardCard.progressPercent}% —
                                    keep going
                                </div>
                            </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-right text-[11px] text-[#999]">
                            {message.timestamp}
                        </div>
                    </div>

                    {/* Quick replies - Uses plan color */}
                    {message.quickReplies &&
                        message.quickReplies.length > 0 && (
                            <div className="border-t border-[#e0e0e0]">
                                {message.quickReplies.map((reply) => (
                                    <button
                                        key={reply.action + reply.label}
                                        onClick={() =>
                                            onQuickReply?.(
                                                reply.label,
                                                reply.action
                                            )
                                        }
                                        className="w-full border-t border-[#e0e0e0] px-[12px] py-[10px] text-[14px] font-normal flex items-center justify-center gap-[6px] cursor-pointer active:bg-[#f5f5f5]"
                                        style={{
                                            color: message.color || '#0077b6',
                                        }}
                                    >
                                        <ReplyIcon />
                                        {reply.label}
                                    </button>
                                ))}
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
