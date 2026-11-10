import type { WNavItem } from "wispui";
import { CalendarIcon, FocusIcon, ReviewIcon, SettingsIcon, SpacesIcon, WeekIcon } from "./icons";

export const navItems: WNavItem[] = [
  { label: "Today", href: "/", icon: <CalendarIcon />, exact: true },
  { label: "Week", icon: <WeekIcon />, disabled: true },
  { label: "Tasks", icon: "check", disabled: true },
  { label: "Focus", icon: <FocusIcon />, disabled: true },
  { label: "Spaces", icon: <SpacesIcon />, disabled: true },
  { label: "Review", icon: <ReviewIcon />, disabled: true },
  { label: "Settings", icon: <SettingsIcon />, disabled: true },
];
