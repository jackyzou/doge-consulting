import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Polygon/geometric-style Shiba Inu (Doge) logo
 * Built with SVG polygon facets in the brand color palette:
 * Navy (#0F2B46), Teal (#2EC4B6), Gold (#F0A500)
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* ── Background circle ── */}
      <circle cx="50" cy="50" r="48" fill="#0F2B46" />

      {/* ── Head – main shape (warm gold/tan facets) ── */}
      {/* Left face */}
      <polygon points="30,38 50,30 42,55" fill="#F0A500" />
      <polygon points="30,38 42,55 28,60" fill="#D4900A" />
      {/* Right face */}
      <polygon points="50,30 70,38 58,55" fill="#F0A500" />
      <polygon points="70,38 72,60 58,55" fill="#D4900A" />
      {/* Forehead */}
      <polygon points="35,32 50,24 65,32 50,30" fill="#EDBE5A" />
      {/* Center face */}
      <polygon points="42,55 50,30 58,55" fill="#F5C842" />

      {/* ── Ears (triangular, geometric) ── */}
      {/* Left ear – outer */}
      <polygon points="22,30 35,32 30,38" fill="#D4900A" />
      <polygon points="22,30 30,18 35,32" fill="#F0A500" />
      {/* Left ear – inner */}
      <polygon points="26,27 32,22 33,31" fill="#2EC4B6" opacity="0.7" />
      {/* Right ear – outer */}
      <polygon points="78,30 65,32 70,38" fill="#D4900A" />
      <polygon points="78,30 70,18 65,32" fill="#F0A500" />
      {/* Right ear – inner */}
      <polygon points="74,27 68,22 67,31" fill="#2EC4B6" opacity="0.7" />

      {/* ── Muzzle / lower face ── */}
      <polygon points="42,55 50,52 58,55 55,66 50,68 45,66" fill="#EDBE5A" />
      <polygon points="28,60 42,55 45,66 35,72" fill="#D4900A" />
      <polygon points="72,60 58,55 55,66 65,72" fill="#D4900A" />
      {/* Chin */}
      <polygon points="35,72 45,66 50,68 55,66 65,72 50,78" fill="#E8C876" />

      {/* ── White muzzle patch ── */}
      <polygon points="44,56 50,53 56,56 54,63 50,65 46,63" fill="#FFF5E0" />

      {/* ── Eyes ── */}
      <circle cx="40" cy="44" r="3.5" fill="#0F2B46" />
      <circle cx="60" cy="44" r="3.5" fill="#0F2B46" />
      {/* Eye shine */}
      <circle cx="41.5" cy="42.5" r="1.2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="61.5" cy="42.5" r="1.2" fill="#FFFFFF" opacity="0.8" />

      {/* ── Nose ── */}
      <polygon points="47,58 53,58 50,61" fill="#0F2B46" />

      {/* ── Mouth line ── */}
      <path
        d="M47,62 Q50,65 53,62"
        fill="none"
        stroke="#0F2B46"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* ── Geometric accent lines (polygon facet edges) ── */}
      <line x1="50" y1="30" x2="42" y2="55" stroke="#C48800" strokeWidth="0.3" opacity="0.4" />
      <line x1="50" y1="30" x2="58" y2="55" stroke="#C48800" strokeWidth="0.3" opacity="0.4" />
      <line x1="30" y1="38" x2="42" y2="55" stroke="#C48800" strokeWidth="0.3" opacity="0.4" />
      <line x1="70" y1="38" x2="58" y2="55" stroke="#C48800" strokeWidth="0.3" opacity="0.4" />
    </svg>
  );
}
