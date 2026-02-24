import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly / polygon-art Shiba Inu (Doge) logo
 * Detailed geometric facets with warm earth-tone palette
 * No background — transparent, face-only silhouette
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
      <polygon points="22,0 6,30 16,14" fill="#5A2E12" />
      <polygon points="22,0 16,14 30,16" fill="#6D3B1C" />
      <polygon points="6,30 16,14 12,34" fill="#4E2810" />
      <polygon points="16,14 30,16 26,28" fill="#7A4525" />
      <polygon points="16,14 12,34 26,28" fill="#6D3B1C" />
      <polygon points="12,34 26,28 18,42" fill="#7A4525" />

      {/* ── Right Ear ── */}
      <polygon points="78,0 94,30 84,14" fill="#5A2E12" />
      <polygon points="78,0 84,14 70,16" fill="#6D3B1C" />
      <polygon points="94,30 84,14 88,34" fill="#4E2810" />
      <polygon points="84,14 70,16 74,28" fill="#7A4525" />
      <polygon points="84,14 88,34 74,28" fill="#6D3B1C" />
      <polygon points="88,34 74,28 82,42" fill="#7A4525" />

      {/* ── Forehead Upper ── */}
      <polygon points="30,16 50,10 40,20" fill="#A06838" />
      <polygon points="50,10 70,16 60,20" fill="#A06838" />
      <polygon points="30,16 40,20 26,28" fill="#8B5830" />
      <polygon points="70,16 60,20 74,28" fill="#8B5830" />
      <polygon points="40,20 50,10 50,18" fill="#B87D45" />
      <polygon points="50,10 60,20 50,18" fill="#B87D45" />

      {/* ── Forehead Lower ── */}
      <polygon points="40,20 50,18 44,30" fill="#C08A50" />
      <polygon points="50,18 60,20 56,30" fill="#C08A50" />
      <polygon points="50,18 44,30 50,28" fill="#C89860" />
      <polygon points="50,18 56,30 50,28" fill="#C89860" />
      <polygon points="26,28 40,20 32,34" fill="#8B5830" />
      <polygon points="74,28 60,20 68,34" fill="#8B5830" />
      <polygon points="40,20 44,30 32,34" fill="#9B6838" />
      <polygon points="60,20 56,30 68,34" fill="#9B6838" />

      {/* ── Side Face Upper ── */}
      <polygon points="18,42 26,28 32,34" fill="#7A4525" />
      <polygon points="82,42 74,28 68,34" fill="#7A4525" />
      <polygon points="18,42 32,34 24,46" fill="#7A4525" />
      <polygon points="82,42 68,34 76,46" fill="#7A4525" />

      {/* ── Eye Zone Left ── */}
      <polygon points="32,34 44,30 38,40" fill="#9B6838" />
      <polygon points="44,30 50,28 44,38" fill="#B87D45" />
      <polygon points="32,34 38,40 24,46" fill="#8B5830" />
      <polygon points="38,40 44,38 36,46" fill="#6D3B1C" />
      <polygon points="44,30 44,38 38,40" fill="#A07040" />

      {/* ── Eye Zone Right ── */}
      <polygon points="68,34 56,30 62,40" fill="#9B6838" />
      <polygon points="56,30 50,28 56,38" fill="#B87D45" />
      <polygon points="68,34 62,40 76,46" fill="#8B5830" />
      <polygon points="62,40 56,38 64,46" fill="#6D3B1C" />
      <polygon points="56,30 56,38 62,40" fill="#A07040" />

      {/* ── Center Face (nose bridge) ── */}
      <polygon points="50,28 44,38 50,36" fill="#C89860" />
      <polygon points="50,28 56,38 50,36" fill="#C89860" />
      <polygon points="44,38 50,36 46,46" fill="#D4A870" />
      <polygon points="56,38 50,36 54,46" fill="#D4A870" />
      <polygon points="50,36 46,46 50,44" fill="#DCB478" />
      <polygon points="50,36 54,46 50,44" fill="#DCB478" />

      {/* ── Cheeks ── */}
      <polygon points="24,46 38,40 28,52" fill="#7A4525" />
      <polygon points="76,46 62,40 72,52" fill="#7A4525" />
      <polygon points="38,40 36,46 28,52" fill="#8B5830" />
      <polygon points="62,40 64,46 72,52" fill="#8B5830" />
      <polygon points="24,46 28,52 14,56" fill="#6D3B1C" />
      <polygon points="76,46 72,52 86,56" fill="#6D3B1C" />

      {/* ── Below Eyes ── */}
      <polygon points="36,46 46,46 40,54" fill="#C08A50" />
      <polygon points="64,46 54,46 60,54" fill="#C08A50" />
      <polygon points="46,46 50,44 48,52" fill="#D8B070" />
      <polygon points="54,46 50,44 52,52" fill="#D8B070" />
      <polygon points="46,46 48,52 40,54" fill="#C89860" />
      <polygon points="54,46 52,52 60,54" fill="#C89860" />
      <polygon points="48,52 50,44 50,50" fill="#E0BC80" />
      <polygon points="52,52 50,44 50,50" fill="#E0BC80" />

      {/* ── Upper Muzzle ── */}
      <polygon points="40,54 48,52 44,60" fill="#DEB880" />
      <polygon points="60,54 52,52 56,60" fill="#DEB880" />
      <polygon points="48,52 50,50 50,56" fill="#E8C898" />
      <polygon points="52,52 50,50 50,56" fill="#E8C898" />
      <polygon points="48,52 50,56 44,60" fill="#E8C898" />
      <polygon points="52,52 50,56 56,60" fill="#E8C898" />

      {/* ── Nose ── */}
      <polygon points="46,59 54,59 50,64" fill="#2D1810" />
      <polygon points="46,59 50,56 50,59" fill="#3D2818" />
      <polygon points="54,59 50,56 50,59" fill="#3D2818" />

      {/* ── Lower Muzzle ── */}
      <polygon points="44,60 50,56 46,59" fill="#ECD8A8" />
      <polygon points="56,60 50,56 54,59" fill="#ECD8A8" />
      <polygon points="44,60 46,59 40,66" fill="#F0DCC0" />
      <polygon points="56,60 54,59 60,66" fill="#F0DCC0" />
      <polygon points="40,66 50,64 50,72" fill="#F5E8D5" />
      <polygon points="60,66 50,64 50,72" fill="#F5E8D5" />
      <polygon points="40,66 46,59 50,64" fill="#F0E0C8" />
      <polygon points="60,66 54,59 50,64" fill="#F0E0C8" />

      {/* ── Side Muzzle ── */}
      <polygon points="28,52 40,54 32,62" fill="#8B5830" />
      <polygon points="72,52 60,54 68,62" fill="#8B5830" />
      <polygon points="40,54 44,60 40,66" fill="#C08A50" />
      <polygon points="60,54 56,60 60,66" fill="#C08A50" />
      <polygon points="40,54 40,66 32,62" fill="#A07040" />
      <polygon points="60,54 60,66 68,62" fill="#A07040" />

      {/* ── Lower Cheeks ── */}
      <polygon points="14,56 28,52 22,64" fill="#6D3B1C" />
      <polygon points="86,56 72,52 78,64" fill="#6D3B1C" />
      <polygon points="28,52 32,62 22,64" fill="#7A4525" />
      <polygon points="72,52 68,62 78,64" fill="#7A4525" />

      {/* ── Chin ── */}
      <polygon points="32,62 40,66 36,74" fill="#9B6838" />
      <polygon points="68,62 60,66 64,74" fill="#9B6838" />
      <polygon points="40,66 50,72 36,74" fill="#DEB880" />
      <polygon points="60,66 50,72 64,74" fill="#DEB880" />
      <polygon points="22,64 32,62 28,76" fill="#7A4525" />
      <polygon points="78,64 68,62 72,76" fill="#7A4525" />
      <polygon points="32,62 36,74 28,76" fill="#8B5830" />
      <polygon points="68,62 64,74 72,76" fill="#8B5830" />

      {/* ── Lower Chin ── */}
      <polygon points="36,74 50,72 44,82" fill="#C89860" />
      <polygon points="64,74 50,72 56,82" fill="#C89860" />
      <polygon points="50,72 44,82 50,80" fill="#D4A870" />
      <polygon points="50,72 56,82 50,80" fill="#D4A870" />
      <polygon points="28,76 36,74 32,86" fill="#8B5830" />
      <polygon points="72,76 64,74 68,86" fill="#8B5830" />
      <polygon points="36,74 44,82 32,86" fill="#A07040" />
      <polygon points="64,74 56,82 68,86" fill="#A07040" />

      {/* ── Bottom Chest ── */}
      <polygon points="32,86 44,82 40,94" fill="#9B6838" />
      <polygon points="68,86 56,82 60,94" fill="#9B6838" />
      <polygon points="44,82 50,80 50,92" fill="#B87D45" />
      <polygon points="56,82 50,80 50,92" fill="#B87D45" />
      <polygon points="44,82 50,92 40,94" fill="#A07040" />
      <polygon points="56,82 50,92 60,94" fill="#A07040" />
      <polygon points="40,94 50,92 50,106" fill="#B87D45" />
      <polygon points="60,94 50,92 50,106" fill="#B87D45" />
      <polygon points="32,86 40,94 36,100" fill="#8B5830" />
      <polygon points="68,86 60,94 64,100" fill="#8B5830" />
      <polygon points="36,100 40,94 50,106" fill="#9B6838" />
      <polygon points="64,100 60,94 50,106" fill="#9B6838" />

      {/* ── Eyes (angular low-poly) ── */}
      <polygon points="32,42 38,40 36,46" fill="#1A0E08" />
      <polygon points="32,42 36,46 30,45" fill="#2D1A10" />
      <polygon points="68,42 62,40 64,46" fill="#1A0E08" />
      <polygon points="68,42 64,46 70,45" fill="#2D1A10" />
      {/* Eye highlights */}
      <circle cx="33" cy="42.5" r="1" fill="#FFFFFF" opacity="0.45" />
      <circle cx="67" cy="42.5" r="1" fill="#FFFFFF" opacity="0.45" />
    </svg>
  );
}
