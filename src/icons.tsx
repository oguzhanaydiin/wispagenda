import type { ReactNode } from "react";

export function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <Glyph>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </Glyph>
  );
}

export function SunIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="M22 12h-2" />
      <path d="M4 12H2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="m19.07 19.07-1.41-1.41" />
      <path d="m4.93 19.07 1.41-1.41" />
    </Glyph>
  );
}

export function MoonIcon() {
  return (
    <Glyph>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Glyph>
  );
}

export function MonitorIcon() {
  return (
    <Glyph>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </Glyph>
  );
}

export function DeskIcon() {
  return (
    <Glyph>
      <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v6h5" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </Glyph>
  );
}

export function WeekIcon() {
  return (
    <Glyph>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 4v16" />
      <path d="M13 9v11" />
      <path d="M18 9v11" />
    </Glyph>
  );
}

export function FocusIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 3h6" />
    </Glyph>
  );
}

export function SpacesIcon() {
  return (
    <Glyph>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Glyph>
  );
}

export function ReviewIcon() {
  return (
    <Glyph>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Glyph>
  );
}

export function SettingsIcon() {
  return (
    <Glyph>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </Glyph>
  );
}
