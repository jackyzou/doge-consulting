"use client";

import { motion } from "framer-motion";

interface PresenceLocation {
  city: string;
  role: string;
  flag: string;
  x: number; // percentage position on map
  y: number;
}

interface GlobalPresenceMapProps {
  locations: PresenceLocation[];
}

/**
 * SVG world map with animated location pins showing global office presence.
 * Uses a simplified world map outline with pulsing markers.
 */
export default function GlobalPresenceMap({ locations }: GlobalPresenceMapProps) {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified world map paths */}
        <g className="fill-muted-foreground/10 stroke-muted-foreground/25 stroke-[0.5]">
          {/* North America */}
          <path d="M120,80 L150,60 L200,55 L240,65 L260,80 L280,75 L290,90 L280,110 L270,130 L260,120 L240,130 L230,150 L220,160 L200,165 L195,180 L180,190 L175,210 L185,220 L195,230 L200,245 L190,250 L180,240 L165,245 L160,230 L155,210 L140,200 L130,180 L120,160 L110,140 L105,120 L110,100 Z" />
          {/* Greenland */}
          <path d="M280,40 L310,30 L340,35 L350,50 L340,65 L315,70 L290,60 Z" />
          {/* South America */}
          <path d="M210,260 L230,255 L250,260 L270,270 L285,290 L295,320 L290,350 L280,380 L265,400 L250,420 L240,430 L235,420 L230,400 L225,380 L215,360 L205,340 L200,310 L195,290 L200,270 Z" />
          {/* Europe */}
          <path d="M430,75 L450,65 L470,70 L490,65 L510,70 L520,80 L515,95 L510,110 L500,120 L490,115 L480,120 L470,115 L460,120 L450,115 L440,120 L435,110 L430,100 L425,90 Z" />
          {/* British Isles */}
          <path d="M410,75 L420,70 L425,80 L420,90 L412,85 Z" />
          {/* Scandinavia */}
          <path d="M470,40 L480,35 L490,45 L485,60 L475,55 Z" />
          {/* Africa */}
          <path d="M440,140 L470,135 L500,140 L530,150 L545,170 L550,200 L545,230 L535,260 L520,290 L505,310 L490,320 L475,315 L460,300 L450,280 L440,260 L435,230 L430,200 L425,170 L430,150 Z" />
          {/* Middle East */}
          <path d="M530,120 L560,110 L580,120 L590,135 L585,150 L570,155 L555,150 L540,145 L535,135 Z" />
          {/* Russia / Northern Asia */}
          <path d="M520,55 L560,45 L600,40 L650,35 L700,40 L750,45 L800,50 L830,55 L840,65 L830,75 L800,80 L770,85 L740,80 L710,85 L680,80 L650,85 L620,80 L590,85 L560,80 L540,75 L525,70 Z" />
          {/* India */}
          <path d="M620,140 L650,130 L670,140 L675,160 L665,185 L650,205 L635,210 L625,200 L615,180 L610,160 Z" />
          {/* Southeast Asia */}
          <path d="M680,170 L710,165 L730,175 L740,190 L735,205 L720,210 L700,205 L690,195 L685,180 Z" />
          {/* China / East Asia */}
          <path d="M680,85 L720,80 L760,85 L790,95 L800,110 L795,130 L780,145 L760,150 L740,145 L720,150 L700,145 L690,130 L680,115 L675,100 Z" />
          {/* Japan */}
          <path d="M810,95 L820,90 L825,100 L820,115 L815,120 L808,110 L805,100 Z" />
          {/* Korea */}
          <path d="M795,100 L802,95 L805,105 L800,115 L795,110 Z" />
          {/* Australia */}
          <path d="M740,310 L780,300 L820,305 L850,315 L860,335 L855,360 L840,380 L815,390 L790,385 L765,375 L750,355 L740,335 Z" />
          {/* New Zealand */}
          <path d="M870,380 L880,375 L885,390 L878,400 L870,395 Z" />
          {/* Indonesia */}
          <path d="M700,230 L730,225 L760,230 L775,240 L770,250 L745,252 L720,248 L705,240 Z" />
        </g>

        {/* Connection lines between locations */}
        {locations.length >= 2 && (
          <g className="stroke-teal/30 stroke-[1] fill-none">
            {locations.map((loc, i) => {
              if (i === locations.length - 1) return null;
              const next = locations[i + 1];
              const mx = (loc.x * 10 + next.x * 10) / 2;
              const my = Math.min(loc.y * 5, next.y * 5) - 20;
              return (
                <motion.path
                  key={`line-${i}`}
                  d={`M${loc.x * 10},${loc.y * 5} Q${mx},${my} ${next.x * 10},${next.y * 5}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.3 }}
                  strokeDasharray="4 4"
                />
              );
            })}
            {/* Connect last to first */}
            {locations.length >= 3 && (() => {
              const first = locations[0];
              const last = locations[locations.length - 1];
              const mx = (first.x * 10 + last.x * 10) / 2;
              const my = Math.min(first.y * 5, last.y * 5) - 30;
              return (
                <motion.path
                  d={`M${first.x * 10},${first.y * 5} Q${mx},${my} ${last.x * 10},${last.y * 5}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 1.1 }}
                  strokeDasharray="4 4"
                />
              );
            })()}
          </g>
        )}

        {/* Location markers */}
        {locations.map((loc, i) => {
          const cx = loc.x * 10;
          const cy = loc.y * 5;
          return (
            <g key={loc.city}>
              {/* Pulse ring */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={12}
                className="fill-teal/20 stroke-teal/40 stroke-[0.5]"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: [0.5, 1.5, 1], opacity: [0, 0.6, 0.3] }}
                viewport={{ once: true }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
              {/* Center dot */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={5}
                className="fill-teal stroke-white stroke-[1.5]"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.2, type: "spring" }}
              />
              {/* Label */}
              <motion.g
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.2 }}
              >
                <rect
                  x={cx - 45}
                  y={cy + 12}
                  width={90}
                  height={28}
                  rx={6}
                  className="fill-card stroke-border/60 stroke-[0.5]"
                  filter="url(#shadow)"
                />
                <text
                  x={cx}
                  y={cy + 23}
                  textAnchor="middle"
                  className="fill-foreground text-[8px] font-semibold"
                >
                  {loc.flag} {loc.city}
                </text>
                <text
                  x={cx}
                  y={cy + 34}
                  textAnchor="middle"
                  className="fill-teal text-[6px] font-medium"
                >
                  {loc.role}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
