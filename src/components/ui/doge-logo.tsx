import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly geometric Shiba Inu (Doge) logo — SVG recreation
 * Warm browns, cream face mask, black eyes, dark nose
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* ── Left Ear ── */}
      <polygon points="42,8 18,52 58,40" fill="#C49555" />
      <polygon points="42,8 58,40 72,22" fill="#B5843E" />
      <polygon points="18,52 58,40 40,68" fill="#A07030" />

      {/* ── Right Ear ── */}
      <polygon points="158,8 182,52 142,40" fill="#C49555" />
      <polygon points="158,8 142,40 128,22" fill="#B5843E" />
      <polygon points="182,52 142,40 160,68" fill="#A07030" />

      {/* ── Forehead top ── */}
      <polygon points="72,22 100,16 100,40" fill="#D4A050" />
      <polygon points="128,22 100,16 100,40" fill="#C89445" />
      <polygon points="72,22 58,40 100,40" fill="#BE8A3C" />
      <polygon points="128,22 142,40 100,40" fill="#BE8A3C" />

      {/* ── Forehead sides ── */}
      <polygon points="58,40 40,68 70,60" fill="#B07838" />
      <polygon points="142,40 160,68 130,60" fill="#B07838" />
      <polygon points="58,40 70,60 100,40" fill="#C49048" />
      <polygon points="142,40 130,60 100,40" fill="#C49048" />

      {/* ── White face mask — center V ── */}
      <polygon points="100,40 78,68 100,72" fill="#F2EBE0" />
      <polygon points="100,40 122,68 100,72" fill="#E8E0D4" />
      <polygon points="100,40 70,60 78,68" fill="#EDE5D8" />
      <polygon points="100,40 130,60 122,68" fill="#E5DDD0" />

      {/* ── Eyes ── */}
      <polygon points="52,72 70,60 62,84" fill="#1A1A1A" />
      <polygon points="52,72 40,68 62,84" fill="#222222" />
      <polygon points="148,72 130,60 138,84" fill="#1A1A1A" />
      <polygon points="148,72 160,68 138,84" fill="#222222" />

      {/* ── Upper cheeks (outer) ── */}
      <polygon points="40,68 52,72 18,90" fill="#C8984E" />
      <polygon points="160,68 148,72 182,90" fill="#C8984E" />
      <polygon points="18,52 40,68 18,90" fill="#B88840" />
      <polygon points="182,52 160,68 182,90" fill="#B88840" />

      {/* ── Under-eye cream ── */}
      <polygon points="62,84 78,68 85,92" fill="#F0E8DC" />
      <polygon points="138,84 122,68 115,92" fill="#F0E8DC" />
      <polygon points="78,68 100,72 85,92" fill="#EDE4D6" />
      <polygon points="122,68 100,72 115,92" fill="#EDE4D6" />

      {/* ── Mid cheeks ── */}
      <polygon points="52,72 62,84 18,90" fill="#E0D0B8" />
      <polygon points="148,72 138,84 182,90" fill="#E0D0B8" />
      <polygon points="62,84 85,92 42,108" fill="#DECAB0" />
      <polygon points="138,84 115,92 158,108" fill="#DECAB0" />
      <polygon points="18,90 62,84 42,108" fill="#D0B890" />
      <polygon points="182,90 138,84 158,108" fill="#D0B890" />

      {/* ── Nose ── */}
      <polygon points="85,92 100,88 100,102" fill="#454040" />
      <polygon points="115,92 100,88 100,102" fill="#3A3636" />
      <polygon points="85,92 100,102 90,104" fill="#4A4545" />
      <polygon points="115,92 100,102 110,104" fill="#4A4545" />

      {/* ── Muzzle / mouth ── */}
      <polygon points="90,104 100,102 100,114" fill="#A09585" />
      <polygon points="110,104 100,102 100,114" fill="#958A7A" />
      <polygon points="90,104 100,114 75,112" fill="#C0B8A8" />
      <polygon points="110,104 100,114 125,112" fill="#C0B8A8" />

      {/* ── Lower cheeks ── */}
      <polygon points="42,108 85,92 75,112" fill="#C8A870" />
      <polygon points="158,108 115,92 125,112" fill="#C8A870" />
      <polygon points="18,90 42,108 24,130" fill="#B08848" />
      <polygon points="182,90 158,108 176,130" fill="#B08848" />
      <polygon points="42,108 75,112 24,130" fill="#BA9450" />
      <polygon points="158,108 125,112 176,130" fill="#BA9450" />

      {/* ── Chin ── */}
      <polygon points="75,112 100,114 70,140" fill="#A88048" />
      <polygon points="125,112 100,114 130,140" fill="#A88048" />
      <polygon points="24,130 75,112 70,140" fill="#B89050" />
      <polygon points="176,130 125,112 130,140" fill="#B89050" />
      <polygon points="24,130 70,140 50,162" fill="#C09858" />
      <polygon points="176,130 130,140 150,162" fill="#C09858" />

      {/* ── Jaw bottom ── */}
      <polygon points="70,140 100,114 100,158" fill="#B08040" />
      <polygon points="130,140 100,114 100,158" fill="#B08040" />
      <polygon points="50,162 70,140 100,158" fill="#A87838" />
      <polygon points="150,162 130,140 100,158" fill="#A87838" />

      {/* ── Bottom point ── */}
      <polygon points="50,162 100,158 80,190" fill="#B58845" />
      <polygon points="150,162 100,158 120,190" fill="#B58845" />
      <polygon points="80,190 100,158 100,210" fill="#A07838" />
      <polygon points="120,190 100,158 100,210" fill="#A07838" />
    </svg>
  );
}
