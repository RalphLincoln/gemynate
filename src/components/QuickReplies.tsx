import type { QuickReply } from '../types';

interface QuickRepliesProps {
    replies: QuickReply[];
    onSelect: (label: string, action: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
    return (
        <div className="flex gap-[6px] flex-wrap self-start max-w-[85%] mt-[2px] animate-[fade-in_0.2s_ease-out]">
            {replies.map((reply) => (
                <button
                    key={reply.label}
                    onClick={() => onSelect(reply.label, reply.action)}
                    className="bg-white border border-[#d1d7db] text-[#53bdeb] text-[14px] font-normal px-[14px] py-[7px] rounded-[20px] shadow-[0_1px_0.5px_rgba(0,0,0,0.08)] active:bg-[#e9e9e9] transition-colors cursor-pointer"
                >
                    {reply.label}
                </button>
            ))}
        </div>
    );
}
