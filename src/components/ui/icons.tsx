/** Shared inline SVG icons — 1.5px strokes, geometric, survey-flavoured. */

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.552 4.1 1.518 5.828L.057 23.5l5.818-1.526A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.877 9.877 0 01-5.03-1.376l-.361-.214-3.733.98.995-3.643-.235-.374A9.885 9.885 0 012.118 12C2.118 6.525 6.525 2.118 12 2.118S21.882 6.525 21.882 12 17.475 21.882 12 21.882z" />
    </svg>
  );
}

export function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M1.5 8h13M9.5 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M2.5 11.5l9-9M4 2.5h7.5V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Meridian globe — the language switch. Survey-flavoured: the equator and
 *  meridian read like a plotted grid wrapped onto a sphere. */
export function GlobeIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.3" />
      <path d="M1.7 8h12.6" strokeWidth="1" />
      <ellipse cx="8" cy="8" rx="3.1" ry="6.3" strokeWidth="1" />
    </svg>
  );
}

/** Plot-grid glyph for the plotted-developments pillar. */
export function PlotIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="6" width="25" height="18" rx="1.5" />
      <path d="M10.5 6v18M19.5 6v18M2.5 15h25" strokeWidth="1.1" />
      <circle cx="15" cy="15" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Home glyph for the construction pillar. */
export function HomeIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4.5 13L15 4.5 25.5 13v11a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 24V13z" strokeLinejoin="round" />
      <path d="M11.5 25.5v-8h7v8" strokeLinejoin="round" strokeWidth="1.1" />
    </svg>
  );
}

/** Brick courses glyph — the build step. */
export function BuildIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 24.5h24" />
      <path d="M5 24.5v-5h20v5M5 19.5v-5h20v5M8 14.5v-5h14v5" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M12.5 19.5v-5M17.5 24.5v-5M15 9.5v5" strokeWidth="1.1" />
      <path d="M15 4.5l4 2.5h-8l4-2.5z" strokeLinejoin="round" strokeWidth="1.1" />
    </svg>
  );
}

/** Key glyph — the handover step. */
export function KeyIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="15" r="5.5" />
      <circle cx="10" cy="15" r="1.7" strokeWidth="1.1" />
      <path d="M15.5 15h11M22.5 15v4M26.5 15v3" strokeLinecap="round" />
    </svg>
  );
}

/** Four-point survey star — used as a marquee separator. */
export function SurveyStar({ size = 10, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 0c.4 2.6 1.9 4.3 5 5-3.1.7-4.6 2.4-5 5-.4-2.6-1.9-4.3-5-5 3.1-.7 4.6-2.4 5-5z" />
    </svg>
  );
}

export function CompassRose({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <circle cx="22" cy="22" r="20.5" stroke="currentColor" strokeWidth="1" opacity=".4" />
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth=".6" opacity=".28" strokeDasharray="2 3" />
      <path d="M22 5l2.6 14.4L22 17.5l-2.6 1.9L22 5z" fill="currentColor" opacity=".85" />
      <path d="M22 39l-2.6-14.4 2.6 1.9 2.6-1.9L22 39z" fill="currentColor" opacity=".35" />
      <text x="22" y="3.4" textAnchor="middle" fontSize="4.6" fill="currentColor" fontFamily="monospace" opacity=".8">N</text>
    </svg>
  );
}
