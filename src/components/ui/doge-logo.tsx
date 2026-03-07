import { cn } from "@/lib/utils";

interface DogeLogoProps {
  className?: string;
  size?: number;
}

/**
 * Low-poly Shiba Inu (Doge) logo
 * Uses the SVG file at /doge-logo.svg
 */
export function DogeLogo({ className, size = 32 }: DogeLogoProps) {
  return (
    <img
      src="/doge-logo.svg"
      alt="Doge Consulting"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
