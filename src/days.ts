import type { Block, Task } from "./sample";

export type SavedDay = {
  blocks: Block[];
  tasks: Task[];
};

const storageKey = "wispagenda-days";

export function emptyDay(): SavedDay {
  return { blocks: [], tasks: [] };
}

export function loadDays(): Record<string, SavedDay> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const saved = JSON.parse(raw) as Record<string, SavedDay>;
    const days: Record<string, SavedDay> = {};
    for (const [key, day] of Object.entries(saved)) {
      if (!day || !Array.isArray(day.blocks) || !Array.isArray(day.tasks)) continue;
      days[key] = { blocks: day.blocks, tasks: day.tasks };
    }
    return days;
  } catch {
    return {};
  }
}

export function saveDays(days: Record<string, SavedDay>) {
  localStorage.setItem(storageKey, JSON.stringify(days));
}

export function shiftKey(key: string, amount: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

export function formatDay(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
