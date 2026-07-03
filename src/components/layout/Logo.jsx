export default function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1B6FB0" />
          <stop offset="1" stopColor="#123B63" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logoGradient)" />
      <g stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M20 24 L32 32 L44 24" />
        <path d="M20 40 L32 32 L44 40" />
      </g>
      <circle cx="20" cy="24" r="3" fill="#FFFFFF" />
      <circle cx="44" cy="24" r="3" fill="#FFFFFF" />
      <circle cx="20" cy="40" r="3" fill="#FFFFFF" />
      <circle cx="44" cy="40" r="3" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="3.6" fill="#FF6B4D" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`font-display text-lg font-bold tracking-tight text-ink ${className}`}>
      Linktopus
    </span>
  );
}
