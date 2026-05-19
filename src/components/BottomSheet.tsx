import type { ReactNode } from 'react';

interface BottomSheetProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export function BottomSheet({ title, children, onClose }: BottomSheetProps) {
    return (
        <div
            className="absolute inset-1 bg-black/35 rounded-[20px] flex items-end z-10 overflow-hidden animate-backdrop-fade"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-t-[14px] w-full max-h-[92%] flex flex-col animate-slide-up">
                <div className="w-9 h-1 bg-[#ccc] rounded-full mx-auto mt-2.5 mb-1.5" />
                <div className="text-base font-semibold text-[#222] text-center px-4 pb-3 border-b border-[#e5e5e5]">
                    {title}
                </div>
                <div
                    className="flex-1 overflow-y-auto"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
