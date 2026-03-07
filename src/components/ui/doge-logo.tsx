import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly geometric Shiba Inu (Doge) logo
 * Detailed recreation with ~60 polygon facets
 * Pointed ears, cream mask, dark eyes, warm browns
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 240 280"
      width={size}
      height={size * (280/240)}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* ═══ LEFT EAR (pointed, triangular) ═══ */}
      <polygon points="52,4 30,55 68,48" fill="#C49A58" />
      <polygon points="52,4 68,48 80,28" fill="#B88A48" />
      <polygon points="30,55 50,72 68,48" fill="#A07038" />

      {/* ═══ RIGHT EAR (pointed, triangular) ═══ */}
      <polygon points="188,4 210,55 172,48" fill="#C49A58" />
      <polygon points="188,4 172,48 160,28" fill="#B88A48" />
      <polygon points="210,55 190,72 172,48" fill="#A07038" />

      {/* ═══ FOREHEAD ═══ */}
      {/* Top center */}
      <polygon points="80,28 120,18 120,48" fill="#D4A45C" />
      <polygon points="160,28 120,18 120,48" fill="#C89850" />
      {/* Forehead sides - darker V */}
      <polygon points="80,28 68,48 120,48" fill="#BF8E42" />
      <polygon points="160,28 172,48 120,48" fill="#BF8E42" />
      {/* Lower forehead connecting to face */}
      <polygon points="68,48 50,72 82,72" fill="#B58240" />
      <polygon points="172,48 190,72 158,72" fill="#B58240" />
      <polygon points="68,48 82,72 120,48" fill="#C8924A" />
      <polygon points="172,48 158,72 120,48" fill="#C8924A" />

      {/* ═══ WHITE/CREAM FACE MASK (V-shape) ═══ */}
      {/* Upper mask - between eyes */}
      <polygon points="120,48 96,72 120,78" fill="#F5EFE4" />
      <polygon points="120,48 144,72 120,78" fill="#EBE4D6" />
      {/* Mask connecting to forehead */}
      <polygon points="120,48 82,72 96,72" fill="#EDE6DA" />
      <polygon points="120,48 158,72 144,72" fill="#E5DDD0" />
      {/* Under-eye cream area */}
      <polygon points="96,72 120,78 100,98" fill="#F2ECDF" />
      <polygon points="144,72 120,78 140,98" fill="#EDE5D8" />
      {/* Bridge of nose - narrow cream */}
      <polygon points="120,78 100,98 120,100" fill="#F0E8DC" />
      <polygon points="120,78 140,98 120,100" fill="#E8E0D2" />

      {/* ═══ EYES (dark angular patches) ═══ */}
      <polygon points="68,76 82,72 76,92" fill="#2A2420" />
      <polygon points="82,72 96,72 76,92" fill="#1E1A18" />
      <polygon points="172,76 158,72 164,92" fill="#2A2420" />
      <polygon points="158,72 144,72 164,92" fill="#1E1A18" />

      {/* ═══ UPPER CHEEKS (warm golden-brown) ═══ */}
      <polygon points="50,72 68,76 30,100" fill="#C89850" />
      <polygon points="190,72 172,76 210,100" fill="#C89850" />
      <polygon points="30,55 50,72 30,100" fill="#BA8C44" />
      <polygon points="210,55 190,72 210,100" fill="#BA8C44" />

      {/* ═══ MID CHEEKS (lighter tan/cream) ═══ */}
      <polygon points="68,76 76,92 30,100" fill="#DCC8A8" />
      <polygon points="172,76 164,92 210,100" fill="#DCC8A8" />
      <polygon points="76,92 100,98 50,118" fill="#E8D8C0" />
      <polygon points="164,92 140,98 190,118" fill="#E8D8C0" />
      <polygon points="30,100 76,92 50,118" fill="#CDB89A" />
      <polygon points="210,100 164,92 190,118" fill="#CDB89A" />

      {/* ═══ NOSE (dark charcoal triangle) ═══ */}
      <polygon points="100,98 120,96 120,112" fill="#4A4340" />
      <polygon points="140,98 120,96 120,112" fill="#3E3835" />
      <polygon points="100,98 120,112 108,114" fill="#504845" />
      <polygon points="140,98 120,112 132,114" fill="#504845" />

      {/* ═══ MUZZLE (gray-brown tones below nose) ═══ */}
      <polygon points="108,114 120,112 120,126" fill="#A09888" />
      <polygon points="132,114 120,112 120,126" fill="#959080" />
      {/* Muzzle sides */}
      <polygon points="108,114 120,126 88,124" fill="#BEB4A0" />
      <polygon points="132,114 120,126 152,124" fill="#BEB4A0" />
      {/* Lower muzzle shadow */}
      <polygon points="88,124 120,126 98,140" fill="#A8A090" />
      <polygon points="152,124 120,126 142,140" fill="#A8A090" />

      {/* ═══ LOWER CHEEKS (golden-brown) ═══ */}
      <polygon points="50,118 100,98 88,124" fill="#C8A870" />
      <polygon points="190,118 140,98 152,124" fill="#C8A870" />
      <polygon points="30,100 50,118 28,142" fill="#B08845" />
      <polygon points="210,100 190,118 212,142" fill="#B08845" />
      <polygon points="50,118 88,124 28,142" fill="#BA9450" />
      <polygon points="190,118 152,124 212,142" fill="#BA9450" />

      {/* ═══ CHIN/JAW (darker browns tapering down) ═══ */}
      <polygon points="88,124 98,140 28,142" fill="#A88048" />
      <polygon points="152,124 142,140 212,142" fill="#A88048" />
      {/* Inner jaw */}
      <polygon points="98,140 120,126 120,158" fill="#9A8870" />
      <polygon points="142,140 120,126 120,158" fill="#9A8870" />
      {/* Jaw sides */}
      <polygon points="28,142 98,140 60,172" fill="#B89050" />
      <polygon points="212,142 142,140 180,172" fill="#B89050" />

      {/* ═══ BOTTOM JAW (tapers to chin point) ═══ */}
      <polygon points="60,172 98,140 120,158" fill="#A07838" />
      <polygon points="180,172 142,140 120,158" fill="#A07838" />
      <polygon points="60,172 120,158 90,204" fill="#B58845" />
      <polygon points="180,172 120,158 150,204" fill="#B58845" />

      {/* ═══ CHIN POINT ═══ */}
      <polygon points="90,204 120,158 120,230" fill="#9A7435" />
      <polygon points="150,204 120,158 120,230" fill="#9A7435" />
      <polygon points="90,204 120,230 105,248" fill="#8C6830" />
      <polygon points="150,204 120,230 135,248" fill="#8C6830" />
      <polygon points="105,248 120,230 120,268" fill="#7E5E2C" />
      <polygon points="135,248 120,230 120,268" fill="#7E5E2C" />
    </svg>
  );
}
