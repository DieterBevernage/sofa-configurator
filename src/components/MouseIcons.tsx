// Custom mouse icons matching user style and color

const HIGHLIGHT_COLOR = "#6d7759"; // Olive/Sage green from swatch

export const MouseLeftClick = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Body */}
        <rect x="5" y="5" width="90" height="140" rx="45" stroke="currentColor" strokeWidth="8" />
        {/* Horizontal Divider */}
        <path d="M5 75H95" stroke="currentColor" strokeWidth="8" />
        {/* Vertical Divider */}
        <path d="M50 5V75" stroke="currentColor" strokeWidth="8" />
        {/* Highlight Left Button */}
        <path d="M50 5H50C25.1472 5 5 25.1472 5 50V75H50V5Z" fill={HIGHLIGHT_COLOR} />
        {/* Scroll Wheel */}
        <rect x="42" y="30" width="16" height="35" rx="8" stroke="currentColor" strokeWidth="8" fill="white" />
    </svg>
);

export const MouseMiddleClick = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="140" rx="45" stroke="currentColor" strokeWidth="8" />
        <path d="M5 75H95" stroke="currentColor" strokeWidth="8" />
        <path d="M50 5V75" stroke="currentColor" strokeWidth="8" />
        {/* Highlight Wheel */}
        <rect x="42" y="30" width="16" height="35" rx="8" fill={HIGHLIGHT_COLOR} />
        <rect x="42" y="30" width="16" height="35" rx="8" stroke="currentColor" strokeWidth="8" />
    </svg>
);

export const MouseScroll = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="140" rx="45" stroke="currentColor" strokeWidth="8" />
        <path d="M5 75H95" stroke="currentColor" strokeWidth="8" />
        <path d="M50 5V75" stroke="currentColor" strokeWidth="8" />
        <rect x="42" y="30" width="16" height="35" rx="8" stroke="currentColor" strokeWidth="8" fill={HIGHLIGHT_COLOR} />
        {/* Scroll Arrows */}
        <path d="M50 15L42 22H58L50 15Z" fill="currentColor" />
        <path d="M50 85L42 78H58L50 85Z" fill="currentColor" />
    </svg>
);
