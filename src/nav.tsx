import type { WNavItem } from "wispui";
import { CalendarIcon, DeskIcon, FocusIcon, ReviewIcon, SettingsIcon, SpacesIcon, WeekIcon } from "./icons";

export const navItems: WNavItem[] = [
  { label: "Today", href: "/", icon: <CalendarIcon />, exact: true },
  { label: "Desk", href: "/desk", icon: <DeskIcon /> },
  { label: "Week", href: "/week", icon: <WeekIcon /> },
  { label: "Tasks", href: "/tasks", icon: "check" },
  { label: "Focus", icon: <FocusIcon />, disabled: true },
  { label: "Spaces", icon: <SpacesIcon />, disabled: true },
  { label: "Review", href: "/review", icon: <ReviewIcon /> },
  { label: "Settings", icon: <SettingsIcon />, disabled: true },
];
