export function Topology() {
  return (
    <svg
      viewBox="0 0 440 340"
      aria-hidden="true"
      className="h-auto w-full"
      fill="none"
    >
      <defs>
        <pattern id="jn-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M40 0H0V40"
            stroke="var(--line)"
            strokeWidth="1"
            opacity="0.7"
          />
        </pattern>
      </defs>

      <rect width="440" height="340" fill="url(#jn-grid)" />

      <path
        className="jn-link"
        d="M198 150C262 138 286 104 316 96"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
      />
      <path
        className="jn-link"
        d="M198 190C262 202 286 236 316 244"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
      />

      <path
        className="jn-flow"
        d="M198 150C262 138 286 104 316 96"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="8 300"
        strokeLinecap="round"
      />
      <path
        className="jn-flow jn-flow-delayed"
        d="M198 190C262 202 286 236 316 244"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="8 300"
        strokeLinecap="round"
      />

      <g>
        <circle cx="150" cy="170" r="66" stroke="var(--line)" strokeWidth="1" />
        <circle cx="150" cy="170" r="48" fill="var(--surface-raised)" />
        <circle cx="150" cy="170" r="48" stroke="var(--line-strong)" strokeWidth="1.5" />
        <circle cx="150" cy="170" r="36" stroke="var(--accent)" strokeWidth="1" opacity="0.55" />
        <text
          x="150"
          y="177"
          textAnchor="middle"
          fill="var(--fg)"
          fontSize="24"
          fontWeight="700"
          letterSpacing="1"
          fontFamily="var(--font-mono)"
        >
          JN
        </text>
      </g>

      <g>
        <rect
          x="316"
          y="64"
          width="72"
          height="64"
          rx="6"
          fill="var(--surface-raised)"
          stroke="var(--line-strong)"
          strokeWidth="1.5"
        />
        <rect x="330" y="80" width="44" height="3" fill="var(--accent)" />
        <rect x="330" y="92" width="30" height="3" fill="var(--line-strong)" />
        <rect x="330" y="104" width="38" height="3" fill="var(--line-strong)" />
      </g>

      <g>
        <rect
          x="316"
          y="212"
          width="72"
          height="64"
          rx="6"
          fill="var(--surface-raised)"
          stroke="var(--line-strong)"
          strokeWidth="1.5"
        />
        <rect x="330" y="228" width="44" height="3" fill="var(--accent)" />
        <rect x="330" y="240" width="36" height="3" fill="var(--line-strong)" />
        <rect x="330" y="252" width="24" height="3" fill="var(--line-strong)" />
      </g>
    </svg>
  );
}
