import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly / polygon-art Shiba Inu (Doge) logo
 * Realistic warm earth-tone palette — browns, tans, creams, whites
 * No background circle — transparent, face-only silhouette
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* ── Left Ear ── */}
      <polygon points="18,2 8,28 24,14" fill="#6B3218" />
      <polygon points="18,2 24,14 30,22" fill="#8B4726" />
      <polygon points="8,28 24,14 30,22" fill="#A0582E" />
      <polygon points="8,28 30,22 18,38" fill="#8B4726" />

      {/* ── Right Ear ── */}
      <polygon points="82,2 76,14 92,28" fill="#6B3218" />
      <polygon points="82,2 70,22 76,14" fill="#8B4726" />
      <polygon points="92,28 76,14 70,22" fill="#A0582E" />
      <polygon points="92,28 70,22 82,38" fill="#8B4726" />

      {/* ── Forehead ── */}
      <polygon points="30,22 50,18 40,32" fill="#B87333" />
      <polygon points="50,18 70,22 60,32" fill="#B87333" />
      <polygon points="40,32 50,18 50,30" fill="#C8894A" />
      <polygon points="50,18 60,32 50,30" fill="#C8894A" />

      {/* ── Side transitions ── */}
      <polygon points="18,38 30,22 40,32" fill="#A0582E" />
      <polygon points="82,38 70,22 60,32" fill="#A0582E" />

      {/* ── Upper face ── */}
      <polygon points="40,32 50,30 42,46" fill="#D4A06B" />
      <polygon points="50,30 60,32 58,46" fill="#D4A06B" />
      <polygon points="50,30 42,46 50,44" fill="#DEB87E" />
      <polygon points="50,30 58,46 50,44" fill="#DEB87E" />
      <polygon points="18,38 40,32 26,50" fill="#B87333" />
      <polygon points="82,38 60,32 74,50" fill="#B87333" />
      <polygon points="26,50 40,32 42,46" fill="#C8894A" />
      <polygon points="74,50 60,32 58,46" fill="#C8894A" />

      {/* ── Mid-face around eyes ── */}
      <polygon points="42,46 50,44 46,56" fill="#E8C99B" />
      <polygon points="50,44 58,46 54,56" fill="#E8C99B" />
      <polygon points="26,50 42,46 30,60" fill="#B87333" />
      <polygon points="74,50 58,46 70,60" fill="#B87333" />
      <polygon points="30,60 42,46 46,56" fill="#C8894A" />
      <polygon points="70,60 58,46 54,56" fill="#C8894A" />

      {/* ── Muzzle ── */}
      <polygon points="46,56 54,56 50,60" fill="#F5E6D3" />
      <polygon points="46,56 50,60 40,66" fill="#EDD8BC" />
      <polygon points="54,56 50,60 60,66" fill="#EDD8BC" />
      <polygon points="30,60 46,56 40,66" fill="#D4A06B" />
      <polygon points="70,60 54,56 60,66" fill="#D4A06B" />

      {/* ── Nose ── */}
      <polygon points="46,60 54,60 50,65" fill="#2D1810" />

      {/* ── Lower muzzle ── */}
      <polygon points="40,66 50,60 50,72" fill="#F5EBE0" />
      <polygon points="60,66 50,60 50,72" fill="#F5EBE0" />
      <polygon points="30,60 40,66 32,74" fill="#C8894A" />
      <polygon points="70,60 60,66 68,74" fill="#C8894A" />

      {/* ── Chin ── */}
      <polygon points="40,66 50,72 32,74" fill="#F0DCC0" />
      <polygon points="60,66 50,72 68,74" fill="#F0DCC0" />
      <polygon points="32,74 50,72 50,82" fill="#F5EBE0" />
      <polygon points="68,74 50,72 50,82" fill="#F5EBE0" />

      {/* ── Chest ── */}
      <polygon points="32,74 50,82 30,90" fill="#E8D5BE" />
      <polygon points="68,74 50,82 70,90" fill="#E8D5BE" />
      <polygon points="50,82 30,90 50,96" fill="#F0DCC0" />
      <polygon points="50,82 70,90 50,96" fill="#F0DCC0" />
      <polygon points="30,90 50,96 36,105" fill="#D4A06B" />
      <polygon points="70,90 50,96 64,105" fill="#D4A06B" />
      <polygon points="36,105 50,96 50,110" fill="#DEB87E" />
      <polygon points="64,105 50,96 50,110" fill="#DEB87E" />

      {/* ── Eyes ── */}
      <ellipse cx="38" cy="48" rx="4" ry="3.5" fill="#1A0E08" />
      <ellipse cx="62" cy="48" rx="4" ry="3.5" fill="#1A0E08" />
      {/* Eye highlights */}
      <circle cx="36.5" cy="46.5" r="1.5" fill="#FFFFFF" opacity="0.7" />
      <circle cx="60.5" cy="46.5" r="1.5" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}
