import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Simple low-poly Shiba Inu (Doge) logo
 * Clean geometric polygon style with warm browns, cream mask, dark eyes & nose
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* Left ear */}
      <polygon points="20,2 5,30 30,22" fill="#B5884E" />
      <polygon points="5,30 30,22 18,42" fill="#946430" />

      {/* Right ear */}
      <polygon points="80,2 95,30 70,22" fill="#B5884E" />
      <polygon points="95,30 70,22 82,42" fill="#946430" />

      {/* Forehead */}
      <polygon points="30,22 50,14 50,30" fill="#D4A05A" />
      <polygon points="70,22 50,14 50,30" fill="#C8924E" />
      <polygon points="30,22 50,30 18,42" fill="#B07840" />
      <polygon points="70,22 50,30 82,42" fill="#B07840" />

      {/* White face mask — center V */}
      <polygon points="50,30 38,44 50,46" fill="#F5F0E6" />
      <polygon points="50,30 62,44 50,46" fill="#EDE6D8" />

      {/* Eyes */}
      <polygon points="26,44 38,44 32,54" fill="#1A1A1A" />
      <polygon points="74,44 62,44 68,54" fill="#1A1A1A" />

      {/* Cheeks */}
      <polygon points="18,42 38,44 26,44" fill="#C49050" />
      <polygon points="82,42 62,44 74,44" fill="#C49050" />
      <polygon points="18,42 26,44 8,62" fill="#BA8548" />
      <polygon points="82,42 74,44 92,62" fill="#BA8548" />
      <polygon points="26,44 32,54 8,62" fill="#E8DCC8" />
      <polygon points="74,44 68,54 92,62" fill="#E8DCC8" />

      {/* Under-eye / mid-face white */}
      <polygon points="32,54 38,44 50,46 44,60" fill="#F2EDE0" />
      <polygon points="68,54 62,44 50,46 56,60" fill="#F2EDE0" />

      {/* Nose */}
      <polygon points="44,60 50,58 56,60 50,66" fill="#3A3A3A" />

      {/* Muzzle */}
      <polygon points="44,60 50,66 36,68" fill="#D8D0C0" />
      <polygon points="56,60 50,66 64,68" fill="#D8D0C0" />
      <polygon points="36,68 50,66 50,76" fill="#9A9080" />
      <polygon points="64,68 50,66 50,76" fill="#9A9080" />

      {/* Lower cheeks */}
      <polygon points="8,62 32,54 36,68" fill="#D0B888" />
      <polygon points="92,62 68,54 64,68" fill="#D0B888" />
      <polygon points="8,62 36,68 20,80" fill="#B89058" />
      <polygon points="92,62 64,68 80,80" fill="#B89058" />

      {/* Chin */}
      <polygon points="36,68 50,76 20,80" fill="#A88050" />
      <polygon points="64,68 50,76 80,80" fill="#A88050" />
      <polygon points="20,80 50,76 50,96" fill="#C09858" />
      <polygon points="80,80 50,76 50,96" fill="#C09858" />

      {/* Bottom point */}
      <polygon points="20,80 50,96 36,108" fill="#B08848" />
      <polygon points="80,80 50,96 64,108" fill="#B08848" />
      <polygon points="36,108 50,96 50,118" fill="#A07840" />
      <polygon points="64,108 50,96 50,118" fill="#A07840" />
    </svg>
  );
}
