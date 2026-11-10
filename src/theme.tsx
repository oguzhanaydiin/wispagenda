import { useEffect, useState } from "react";
import { WButton } from "wispui";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const storageKey = "wispagenda-theme";

type ThemeMode = "light" | "dark" | "system";

const nextMode: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const icons = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <MonitorIcon />,
};

function readMode(): ThemeMode {
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // Private mode keeps the system theme.
  }
  return "system";
}

function systemIsDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && systemIsDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeButton() {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  const next = nextMode[mode];

  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      // Ignore storage failures. The class on the document still updates.
    }
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  return (
    <WButton
      color="neutral"
      variant="ghost"
      icon={icons[mode]}
      aria-label={`Theme is ${mode}. Switch to ${next}.`}
      onClick={() => setMode(next)}
    />
  );
}
