import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarWithFallbackProps {
  src?: string | null;
  alt?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
  size?: number | string;
  variant?: "geometric" | "identicon" | "initials";
  colors?: string[];
  square?: boolean;
}

// Generate a hash from string for consistent colors
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate geometric pattern SVG
function generateGeometricAvatar(name: string, size: number, colors: string[]): JSX.Element {
  const hash = hashCode(name);
  const colorIndex = hash % colors.length;
  const backgroundColor = colors[colorIndex];
  const patternColor = colors[(colorIndex + 1) % colors.length];

  const pattern = hash % 4; // 4 different patterns

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={backgroundColor} />
      {pattern === 0 && (
        <>
          <circle cx="25" cy="25" r="15" fill={patternColor} opacity="0.7" />
          <circle cx="75" cy="75" r="15" fill={patternColor} opacity="0.7" />
        </>
      )}
      {pattern === 1 && (
        <>
          <rect x="20" y="20" width="60" height="20" fill={patternColor} opacity="0.7" />
          <rect x="20" y="60" width="60" height="20" fill={patternColor} opacity="0.7" />
        </>
      )}
      {pattern === 2 && (
        <polygon points="50,10 90,90 10,90" fill={patternColor} opacity="0.7" />
      )}
      {pattern === 3 && (
        <>
          <rect x="10" y="10" width="30" height="30" fill={patternColor} opacity="0.7" />
          <rect x="60" y="60" width="30" height="30" fill={patternColor} opacity="0.7" />
        </>
      )}
    </svg>
  );
}

// Generate identicon-style avatar
function generateIdenticonAvatar(name: string, size: number, colors: string[]): JSX.Element {
  const hash = hashCode(name);
  const backgroundColor = colors[hash % colors.length];
  const foregroundColor = colors[(hash + 1) % colors.length];

  // Create a 5x5 grid pattern
  const grid = [];
  for (let i = 0; i < 25; i++) {
    grid.push((hash >> i) & 1);
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={backgroundColor} />
      {grid.map((cell, index) => {
        if (!cell) return null;
        const x = (index % 5) * 20;
        const y = Math.floor(index / 5) * 20;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width="20"
            height="20"
            fill={foregroundColor}
          />
        );
      })}
    </svg>
  );
}

/**
 * Avatar component with custom fallback patterns
 *
 * @param src - Image source URL
 * @param alt - Alt text for the image
 * @param name - User name (used for fallback)
 * @param className - Additional classes for the Avatar component
 * @param fallbackClassName - Additional classes for the AvatarFallback component
 * @param size - Size of the avatar (default: 40)
 * @param variant - Fallback variant (default: "geometric")
 * @param colors - Custom colors for fallback
 * @param square - Whether to display a square avatar
 */
export function AvatarWithFallback({
  src,
  alt,
  name,
  className,
  fallbackClassName,
  size = 40,
  variant = "geometric",
  colors = ["#3B82F6", "#8B5CF6", "#EF4444", "#10B981", "#F59E0B", "#EC4899"],
  square = false,
}: AvatarWithFallbackProps) {
  const borderRadius = square ? "rounded-lg" : "rounded-full";
  const sizeNum = typeof size === "number" ? size : parseInt(size as string, 10) || 40;

  const renderFallback = () => {
    if (variant === "initials") {
      const initials = name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const hash = hashCode(name);
      const backgroundColor = colors[hash % colors.length];

      return (
        <div
          className="w-full h-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor, fontSize: `${sizeNum * 0.4}px` }}
        >
          {initials}
        </div>
      );
    }

    if (variant === "identicon") {
      return generateIdenticonAvatar(name, sizeNum, colors);
    }

    // Default: geometric
    return generateGeometricAvatar(name, sizeNum, colors);
  };

  return (
    <Avatar className={cn("relative", borderRadius, className)}>
      {src ? (
        <AvatarImage
          src={src}
          alt={alt || name}
          className={borderRadius}
        />
      ) : null}

      <AvatarFallback className={cn(borderRadius, "p-0 overflow-hidden", fallbackClassName)}>
        {renderFallback()}
      </AvatarFallback>
    </Avatar>
  );
}
