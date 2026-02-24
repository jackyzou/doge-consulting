import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly / origami-style Shiba Inu (Doge) logo
 * Bold geometric facets matching reference art
 * Shield/kite face shape — wide cheeks, pointed ears & chin
 * Warm browns, tans, cream center, grey muzzle accents
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 100 116"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* ── Left Ear ── */}
      <polygon points="18,0 4,28 28,18" fill="#7E5B38" />
      <polygon points="18,0 28,18 36,22" fill="#A07848" />
      <polygon points="4,28 28,18 16,40" fill="#6B4B2F" />

      {/* ── Right Ear ── */}
      <polygon points="82,0 96,28 72,18" fill="#7E5B38" />
      <polygon points="82,0 72,18 64,22" fill="#A07848" />
      <polygon points="96,28 72,18 84,40" fill="#6B4B2F" />

      {/* ── Forehead Center ── */}
      <polygon points="36,22 50,12 50,28" fill="#C8A470" />
      <polygon points="64,22 50,12 50,28" fill="#C8A470" />
      <polygon points="36,22 50,28 40,38" fill="#DCC090" />
      <polygon points="64,22 50,28 60,38" fill="#DCC090" />

      {/* ── Forehead Sides ── */}
      <polygon points="28,18 36,22 16,40" fill="#946B42" />
      <polygon points="72,18 64,22 84,40" fill="#946B42" />
      <polygon points="36,22 40,38 16,40" fill="#A67C52" />
      <polygon points="64,22 60,38 84,40" fill="#A67C52" />

      {/* ── Center Face — cream V stripe ── */}
      <polygon points="40,38 50,28 50,42" fill="#EDE0CA" />
      <polygon points="60,38 50,28 50,42" fill="#EDE0CA" />
      <polygon points="40,38 50,42 42,50" fill="#F0E6D0" />
      <polygon points="60,38 50,42 58,50" fill="#F0E6D0" />

      {/* ── Eyes (dark angular) ── */}
      <polygon points="24,42 40,38 32,52" fill="#1E1A16" />
      <polygon points="76,42 60,38 68,52" fill="#1E1A16" />

      {/* ── Upper Cheeks ── */}
      <polygon points="16,40 40,38 24,42" fill="#A67C52" />
      <polygon points="84,40 60,38 76,42" fill="#A67C52" />
      <polygon points="16,40 24,42 6,58" fill="#8B6539" />
      <polygon points="84,40 76,42 94,58" fill="#8B6539" />

      {/* ── Below Eyes ── */}
      <polygon points="24,42 32,52 6,58" fill="#A67C52" />
      <polygon points="76,42 68,52 94,58" fill="#A67C52" />
      <polygon points="32,52 42,50 36,60" fill="#C4A068" />
      <polygon points="68,52 58,50 64,60" fill="#C4A068" />

      {/* ── Nose Bridge ── */}
      <polygon points="42,50 50,42 50,56" fill="#EBD8B0" />
      <polygon points="58,50 50,42 50,56" fill="#EBD8B0" />
      <polygon points="42,50 44,56 36,60" fill="#D4B480" />
      <polygon points="58,50 56,56 64,60" fill="#D4B480" />

      {/* ── Nose ── */}
      <polygon points="44,56 56,56 50,64" fill="#4D4540" />

      {/* ── Muzzle (grey tones below nose) ── */}
      <polygon points="36,60 44,56 40,68" fill="#C8A870" />
      <polygon points="64,60 56,56 60,68" fill="#C8A870" />
      <polygon points="44,56 50,64 40,68" fill="#8A7E72" />
      <polygon points="56,56 50,64 60,68" fill="#8A7E72" />
      <polygon points="40,68 50,64 50,74" fill="#7A7068" />
      <polygon points="60,68 50,64 50,74" fill="#7A7068" />

      {/* ── Lower Cheeks ── */}
      <polygon points="6,58 32,52 36,60" fill="#9B7040" />
      <polygon points="94,58 68,52 64,60" fill="#9B7040" />
      <polygon points="6,58 36,60 16,76" fill="#8B6539" />
      <polygon points="94,58 64,60 84,76" fill="#8B6539" />

      {/* ── Upper Chin ── */}
      <polygon points="36,60 40,68 16,76" fill="#A67C52" />
      <polygon points="64,60 60,68 84,76" fill="#A67C52" />
      <polygon points="40,68 50,74 28,82" fill="#B89060" />
      <polygon points="60,68 50,74 72,82" fill="#B89060" />
      <polygon points="16,76 40,68 28,82" fill="#946B42" />
      <polygon points="84,76 60,68 72,82" fill="#946B42" />

      {/* ── Lower Chin ── */}
      <polygon points="28,82 50,74 50,92" fill="#B89868" />
      <polygon points="72,82 50,74 50,92" fill="#B89868" />
      <polygon points="28,82 50,92 38,104" fill="#A67C52" />
      <polygon points="72,82 50,92 62,104" fill="#A67C52" />
      <polygon points="38,104 50,92 50,114" fill="#B89060" />
      <polygon points="62,104 50,92 50,114" fill="#B89060" />
    </svg>
  );
}
