import React, { useEffect, useRef, useCallback } from 'react';
import type { Message, SheetType, CarouselCard } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { PlanCarousel } from './Plancarousel.tsx';

interface ChatViewProps {
    messages: Message[];
    isTyping: boolean;
    onQuickReply: (label: string, action: string) => void;
    onCtaClick: (action: string) => void;
    onViewResponse: (sheet: SheetType) => void;
    onClaimAction?: (claimAction: string, msgId: string, file?: File) => void;
    blurred?: boolean;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatView({
    messages,
    isTyping,
    onQuickReply,
    onCtaClick,
    onViewResponse,
    onClaimAction,
    blurred,
    containerRef,
}: ChatViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingActionRef = useRef<{
        claimAction: string;
        msgId: string;
    } | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleClaimActionClick = useCallback(
        (claimAction: string, msgId: string) => {
            if (
                claimAction === 'upload_photo' ||
                claimAction === 'upload_discharge' ||
                claimAction === 'take_selfie'
            ) {
                pendingActionRef.current = { claimAction, msgId };
                if (fileInputRef.current) {
                    // Set capture attribute based on action
                    if (claimAction === 'take_selfie') {
                        fileInputRef.current.setAttribute('capture', 'user'); // front camera
                    } else {
                        fileInputRef.current.removeAttribute('capture'); // allow gallery or rear camera
                    }
                    fileInputRef.current.value = ''; // reset so same file can be re-selected
                    fileInputRef.current.click();
                }
            } else {
                // For share_location, nights_input — pass through directly
                onClaimAction?.(claimAction, msgId);
            }
        },
        [onClaimAction]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && pendingActionRef.current) {
                const { claimAction, msgId } = pendingActionRef.current;
                pendingActionRef.current = null;
                onClaimAction?.(claimAction, msgId, file);
            }
        },
        [onClaimAction]
    );

    return (
        <div
            ref={(el) => {
                (
                    scrollRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
                if (containerRef)
                    (
                        containerRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = el;
            }}
            tabIndex={-1}
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            aria-hidden={blurred ? true : undefined}
            className={`flex-1 min-w-0 wa-bg py-[12px] px-[18px] flex flex-col gap-[10px] overflow-y-auto hide-scrollbar transition-all ${
                blurred ? 'blur-[2px] opacity-50' : ''
            }`}
        >
            {/* Hidden file input for camera/gallery */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Date pill */}
            <div className="self-center bg-white/90 text-[#54656f] text-[12.5px] font-medium px-[12px] py-[5px] rounded-[8px] my-[6px] shadow-[0_1px_0.5px_rgba(0,0,0,0.1)]">
                Today
            </div>

            {/* System notice */}
            <div className="self-center bg-[#d1f4cc] text-[#3a3a3a] text-[12.5px] text-center px-[14px] py-[7px] rounded-[8px] max-w-[88%] leading-[1.45] my-[3px] shadow-[0_1px_0.5px_rgba(0,0,0,0.07)]">
                This business uses a secure service from Meta to manage this
                chat. Tap to learn more.
            </div>

            {messages.map((msg, i) => {
                const prevMsg = messages[i - 1];
                const isFirstInGroup = !prevMsg || prevMsg.type !== msg.type;
                const hasCarousel =
                    msg.type === 'bot' &&
                    msg.carousel &&
                    msg.carousel.length > 0;

                return (
                    <React.Fragment key={msg.id}>
                        <MessageBubble
                            message={msg}
                            isFirst={isFirstInGroup}
                            onViewResponse={onViewResponse}
                            onCtaClick={onCtaClick}
                            onQuickReply={onQuickReply}
                            onClaimAction={handleClaimActionClick}
                        />
                        {hasCarousel && (
                            <div
                                style={{
                                    overflow: 'hidden',
                                    width: '100%',
                                    flexShrink: 0,
                                }}
                            >
                                <PlanCarousel
                                    plans={msg.carousel!}
                                    onSelectPlan={(planId) => {
                                        const plan = msg.carousel?.find(
                                            (p) => p.id === planId
                                        );
                                        if (plan) {
                                            onQuickReply(
                                                plan.name,
                                                plan.action
                                            );
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {isTyping && <TypingIndicator />}
        </div>
    );
}
