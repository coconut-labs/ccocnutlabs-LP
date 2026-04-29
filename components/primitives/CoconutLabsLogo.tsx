/**
 * CoconutLabsLogo — animated lockup for coconutlabs.org and child sites.
 *
 * Self-contained: inline SVG + inline CSS, no dependencies.
 * Uses currentColor everywhere so it inherits text color from the parent.
 * RSC-safe (no hooks, no browser APIs). Animation is CSS-only.
 *
 * Animation sequence (~1.85s total) when `animate=true`:
 *   0ms     dot 1 drops in from above
 *   250ms   divider 1 fades in with a slight downward wave
 *   500ms   dots 2, 3, 4 drop in simultaneously
 *   750ms   dividers 2 & 3 fade in together
 *   1100ms  "coconut" emerges leftward, "labs" emerges rightward
 *   1550ms  outer brackets snap in fast from outside, framing the mark
 *
 * `prefers-reduced-motion: reduce` skips the animation entirely.
 */

import type { CSSProperties, ReactElement } from "react";

export interface CoconutLabsLogoProps {
  /** Rendered width in pixels. Height scales automatically. Default 245. */
  width?: number;
  /** Whether to play the entry animation. Default true. */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible label for screen readers. Default "Coconut Labs". */
  ariaLabel?: string;
}

export function CoconutLabsLogo({
  width = 245,
  animate = true,
  className = "",
  style,
  ariaLabel = "Coconut Labs",
}: CoconutLabsLogoProps): ReactElement {
  const stateClass = animate ? "cl-animated" : "cl-static";

  return (
    <svg
      width={width}
      viewBox="0 0 245 30"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={`cl-logo ${stateClass} ${className}`.trim()}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    >
      <style>{`
        .cl-logo.cl-static .cl-mark-dot,
        .cl-logo.cl-static .cl-mark-bracket,
        .cl-logo.cl-static .cl-text {
          opacity: 1;
        }
        .cl-logo.cl-static .cl-mark-divider {
          opacity: 0.5;
        }

        .cl-logo.cl-animated .cl-mark-dot,
        .cl-logo.cl-animated .cl-mark-bracket,
        .cl-logo.cl-animated .cl-mark-divider,
        .cl-logo.cl-animated .cl-text {
          opacity: 0;
        }

        .cl-logo.cl-animated .cl-mark-dot-1 {
          animation: cl-dot-drop 350ms cubic-bezier(0.2, 0.8, 0.4, 1) 0ms both;
        }
        .cl-logo.cl-animated .cl-mark-divider-1 {
          animation: cl-divider-wave 400ms ease-out 250ms both;
        }
        .cl-logo.cl-animated .cl-mark-dot-2,
        .cl-logo.cl-animated .cl-mark-dot-3,
        .cl-logo.cl-animated .cl-mark-dot-4 {
          animation: cl-dot-drop 350ms cubic-bezier(0.2, 0.8, 0.4, 1) 500ms both;
        }
        .cl-logo.cl-animated .cl-mark-divider-2,
        .cl-logo.cl-animated .cl-mark-divider-3 {
          animation: cl-divider-wave 400ms ease-out 750ms both;
        }
        .cl-logo.cl-animated .cl-text-coconut {
          animation: cl-text-coconut-emerge 500ms cubic-bezier(0.2, 0.8, 0.4, 1) 1100ms both;
        }
        .cl-logo.cl-animated .cl-text-labs {
          animation: cl-text-labs-emerge 500ms cubic-bezier(0.2, 0.8, 0.4, 1) 1100ms both;
        }
        .cl-logo.cl-animated .cl-mark-bracket-left {
          animation: cl-bracket-left-snap 300ms cubic-bezier(0.2, 0.8, 0.4, 1) 1550ms both;
        }
        .cl-logo.cl-animated .cl-mark-bracket-right {
          animation: cl-bracket-right-snap 300ms cubic-bezier(0.2, 0.8, 0.4, 1) 1550ms both;
        }

        @keyframes cl-dot-drop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cl-divider-wave {
          0%   { opacity: 0;   transform: translateY(-3px); }
          60%  { opacity: 0.5; transform: translateY(1px); }
          100% { opacity: 0.5; transform: translateY(0); }
        }
        @keyframes cl-text-coconut-emerge {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cl-text-labs-emerge {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cl-bracket-left-snap {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cl-bracket-right-snap {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cl-logo .cl-mark-dot,
          .cl-logo .cl-mark-bracket,
          .cl-logo .cl-text {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .cl-logo .cl-mark-divider {
            animation: none !important;
            opacity: 0.5 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* "coconut" — left wordmark, anchored to its right edge */}
      <text
        x="77"
        y="20"
        textAnchor="end"
        fontFamily="inherit"
        fontSize="22"
        fontWeight="400"
        letterSpacing="-0.4"
        fill="currentColor"
        className="cl-text cl-text-coconut"
      >
        coconut
      </text>

      {/* outer left bracket */}
      <path
        d="M 95,3 L 89,3 L 89,27 L 95,27"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="cl-mark-bracket cl-mark-bracket-left"
      />

      {/* big dot 1 */}
      <circle cx="106" cy="15" r="3" fill="currentColor" className="cl-mark-dot cl-mark-dot-1" />

      {/* dotted divider 1 */}
      <g className="cl-mark-divider cl-mark-divider-1">
        <circle cx="117" cy="6" r="0.9" fill="currentColor" />
        <circle cx="117" cy="10.5" r="0.9" fill="currentColor" />
        <circle cx="117" cy="15" r="0.9" fill="currentColor" />
        <circle cx="117" cy="19.5" r="0.9" fill="currentColor" />
        <circle cx="117" cy="24" r="0.9" fill="currentColor" />
      </g>

      {/* big dots 2 & 3 */}
      <circle cx="128" cy="15" r="3" fill="currentColor" className="cl-mark-dot cl-mark-dot-2" />
      <circle cx="150" cy="15" r="3" fill="currentColor" className="cl-mark-dot cl-mark-dot-3" />

      {/* dotted divider 2 — center of mark */}
      <g className="cl-mark-divider cl-mark-divider-2">
        <circle cx="139" cy="6" r="0.9" fill="currentColor" />
        <circle cx="139" cy="10.5" r="0.9" fill="currentColor" />
        <circle cx="139" cy="15" r="0.9" fill="currentColor" />
        <circle cx="139" cy="19.5" r="0.9" fill="currentColor" />
        <circle cx="139" cy="24" r="0.9" fill="currentColor" />
      </g>

      {/* big dot 4 */}
      <circle cx="172" cy="15" r="3" fill="currentColor" className="cl-mark-dot cl-mark-dot-4" />

      {/* dotted divider 3 */}
      <g className="cl-mark-divider cl-mark-divider-3">
        <circle cx="161" cy="6" r="0.9" fill="currentColor" />
        <circle cx="161" cy="10.5" r="0.9" fill="currentColor" />
        <circle cx="161" cy="15" r="0.9" fill="currentColor" />
        <circle cx="161" cy="19.5" r="0.9" fill="currentColor" />
        <circle cx="161" cy="24" r="0.9" fill="currentColor" />
      </g>

      {/* outer right bracket */}
      <path
        d="M 183,3 L 189,3 L 189,27 L 183,27"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="cl-mark-bracket cl-mark-bracket-right"
      />

      {/* "labs" — right wordmark */}
      <text
        x="201"
        y="20"
        fontFamily="inherit"
        fontSize="22"
        fontWeight="400"
        letterSpacing="-0.4"
        fill="currentColor"
        className="cl-text cl-text-labs"
      >
        labs
      </text>
    </svg>
  );
}
