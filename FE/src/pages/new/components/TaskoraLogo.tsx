import React from 'react';
import { TwoColorTheme } from '../theme';

interface TaskoraLogoProps {
    theme: TwoColorTheme;
    size?: 'sm' | 'md' | 'lg';
    showWordmark?: boolean;
    inverted?: boolean;
    className?: string;
}

const SIZE_MAP = {
    sm: { icon: 24, text: 'text-base', gap: 'gap-2' },
    md: { icon: 28, text: 'text-lg', gap: 'gap-2.5' },
    lg: { icon: 36, text: 'text-2xl', gap: 'gap-3' },
};

/**
 * Geometric Taskora brand mark + wordmark.
 * Adapts to the two-color editorial palette (Warm Alabaster & Deep Forest Pine).
 */
const TaskoraLogo: React.FC<TaskoraLogoProps> = ({
    theme,
    size = 'md',
    showWordmark = true,
    inverted = false,
    className = '',
}) => {
    const dims = SIZE_MAP[size];
    const badgeFill = inverted ? theme.bg : theme.ink;
    const markStroke = inverted ? theme.ink : theme.bg;

    return (
        <span className={`inline-flex items-center ${dims.gap} select-none ${className}`}>
            <svg
                width={dims.icon}
                height={dims.icon}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0 transition-transform duration-300 group-hover:scale-95"
            >
                {/* Rounded squircle container */}
                <rect
                    x="1"
                    y="1"
                    width="30"
                    height="30"
                    rx="8.5"
                    fill={badgeFill}
                />
                {/* Subtle inner frame for depth */}
                <rect
                    x="2.25"
                    y="2.25"
                    width="27.5"
                    height="27.5"
                    rx="7.25"
                    stroke={markStroke}
                    strokeOpacity="0.16"
                    strokeWidth="0.75"
                />
                {/* Geometric 'T' crossbar sweeping into an ascending check-horizon */}
                <path
                    d="M8.5 11.25H19.5L23.5 8.5"
                    stroke={markStroke}
                    strokeWidth="2.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Centered vertical stem */}
                <path
                    d="M15.25 11.25V23.25"
                    stroke={markStroke}
                    strokeWidth="2.35"
                    strokeLinecap="round"
                />
                {/* Subtle completion / aura dot */}
                <circle
                    cx="22.5"
                    cy="21.5"
                    r="2"
                    fill={markStroke}
                    fillOpacity="0.9"
                />
            </svg>

            {showWordmark && (
                <span
                    className={`${dims.text} font-semibold tracking-tight leading-none`}
                    style={{ color: inverted ? theme.bg : theme.ink }}
                >
                    Taskora
                </span>
            )}
        </span>
    );
};

export default TaskoraLogo;
