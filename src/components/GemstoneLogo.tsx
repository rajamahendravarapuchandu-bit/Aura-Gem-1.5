import React from 'react';

interface GemstoneLogoProps {
  className?: string;
  size?: number;
}

export const GemstoneLogo: React.FC<GemstoneLogoProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aura-Gem logo"
    >
      <defs>
        {/* Emerald Aura Gradient */}
        <linearGradient id="auraGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#77C69A" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#237A57" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#144D36" stopOpacity="1" />
        </linearGradient>

        {/* Facet Light Gradient */}
        <linearGradient id="facetHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#A8E4C1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#41A378" stopOpacity="0.7" />
        </linearGradient>

        {/* Deep Facet Gradient */}
        <linearGradient id="facetDeep" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#1B6145" />
          <stop offset="100%" stopColor="#0F3827" />
        </linearGradient>
      </defs>

      {/* Subtle outer aura halo */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="currentColor"
        className="text-[var(--color-accent)] opacity-10"
      />

      {/* Main Gemstone Geometry (Brilliant Cut Emerald) */}
      {/* Top Table Facet */}
      <polygon
        points="16,8 32,8 38,18 10,18"
        fill="url(#facetHighlight)"
      />

      {/* Center Table Highlight */}
      <polygon
        points="19,10 29,10 33,16 15,16"
        fill="#C6F3D8"
        opacity="0.6"
      />

      {/* Left Crown Facet */}
      <polygon
        points="16,8 10,18 6,18"
        fill="#368C65"
      />

      {/* Right Crown Facet */}
      <polygon
        points="32,8 42,18 38,18"
        fill="#266D4E"
      />

      {/* Pavilion Center Triangle */}
      <polygon
        points="10,18 38,18 24,42"
        fill="url(#auraGlow)"
      />

      {/* Pavilion Left Facet */}
      <polygon
        points="10,18 6,18 24,42"
        fill="url(#facetDeep)"
      />

      {/* Pavilion Right Facet */}
      <polygon
        points="38,18 42,18 24,42"
        fill="#0E3625"
      />

      {/* Inner Sparkle Geometry Lines */}
      <line
        x1="24"
        y1="18"
        x2="24"
        y2="42"
        stroke="#A8E4C1"
        strokeWidth="1.2"
        opacity="0.8"
      />
      <line
        x1="16"
        y1="8"
        x2="24"
        y2="18"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <line
        x1="32"
        y1="8"
        x2="24"
        y2="18"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        opacity="0.5"
      />

      {/* Diamond Sparkle Accent on Top Edge */}
      <circle cx="21" cy="11" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};
