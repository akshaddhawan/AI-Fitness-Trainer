"use client";

import React, { useEffect, useState } from "react";

interface StatsRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // Hex, HSL, or CSS class
  glowColor?: string;
  label?: string;
  value?: string | number;
}

const StatsRing: React.FC<StatsRingProps> = ({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = "var(--cyber-blue-bright)",
  glowColor = "rgba(24, 206, 242, 0.4)",
  label,
  value,
}) => {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    const progressOffset = circumference - (clampedPercentage / 100) * circumference;
    // Set offset with a short delay for mount transition animation
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <div className="flex flex-col items-center justify-center font-mono">
      <div 
        className="relative flex items-center justify-center" 
        style={{ width: size, height: size }}
      >
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90 select-none"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center label & value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {value !== undefined ? (
            <span className="text-sm font-bold text-foreground tracking-tight">{value}</span>
          ) : (
            <span className="text-sm font-bold text-foreground tracking-tight">{Math.round(percentage)}%</span>
          )}
          {label && (
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsRing;
