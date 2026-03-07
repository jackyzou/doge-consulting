import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Updated Low-poly Shiba Inu Logo
 * Optimized for a clean, borderless vector look 
 * Based on the latest generated image.
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Doge Consulting logo"
    >
      {/* --- Left Side of Head --- */}
      <polygon points="40,20 75,40 10,105" fill="#A87948" /> {/* Ear/Top side */}
      <polygon points="10,105 75,40 30,150" fill="#B58450" /> {/* Side cheek */}
      <polygon points="30,150 75,40 100,200" fill="#916438" /> {/* Lower jaw to chin */}

      {/* --- Right Side of Head --- */}
      <polygon points="160,20 125,40 190,105" fill="#A87948" />
      <polygon points="190,105 125,40 170,150" fill="#B58450" />
      <polygon points="170,150 125,40 100,200" fill="#916438" />

      {/* --- Forehead & Top V --- */}
      <polygon points="40,20 100,40 160,20" fill="#C49158" />
      <polygon points="40,20 75,40 100,40" fill="#B8864E" />
      <polygon points="160,20 125,40 100,40" fill="#B8864E" />

      {/* --- The White Face Mask (Cream) --- */}
      <polygon points="100,40 70,120 100,140" fill="#F5F0E6" /> {/* Center Left */}
      <polygon points="100,40 130,120 100,140" fill="#EBE5D8" /> {/* Center Right */}
      <polygon points="75,40 70,120 100,40" fill="#FFFBF5" />    {/* Top left flare */}
      <polygon points="125,40 130,120 100,40" fill="#FFFBF5" />   {/* Top right flare */}
      
      {/* --- Inner Cheek Transitions --- */}
      <polygon points="75,40 10,105 70,120" fill="#D6C4AD" />
      <polygon points="125,40 190,105 130,120" fill="#D6C4AD" />
      <polygon points="70,120 10,105 30,150" fill="#B8A085" />
      <polygon points="130,120 190,105 170,150" fill="#B8A085" />

      {/* --- Eyes --- */}
      <polygon points="70,80 85,90 75,95" fill="#2D2926" />
      <polygon points="130,80 115,90 125,95" fill="#2D2926" />

      {/* --- Nose & Muzzle Shadow --- */}
      <polygon points="88,105 112,105 100,125" fill="#3D3935" /> {/* Nose */}
      <polygon points="85,125 115,125 100,140" fill="#7D756D" /> {/* Muzzle split */}
      <polygon points="70,120 100,140 100,170" fill="#9C9184" /> {/* Chin shadow left */}
      <polygon points="130,120 100,140 100,170" fill="#8C8276" /> {/* Chin shadow right */}

      {/* --- Bottom Point (Chin) --- */}
      <polygon points="30,150 100,200 100,170" fill="#A67E50" />
      <polygon points="170,150 100,200 100,170" fill="#A67E50" />
    </svg>
  );
}
