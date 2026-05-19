export function TypingIndicator() {
    return (
        <div
            role="status"
            aria-label="Gemynate is typing"
            className="self-start bg-white rounded-[8px] rounded-tl-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.12)] px-[14px] py-[10px] flex gap-[4px] items-center relative bubble-tail-left"
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-[7px] h-[7px] rounded-full bg-[#8c8c8c]"
                    style={{
                        animation: `typing-dot 1.4s infinite`,
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </div>
    );
}
