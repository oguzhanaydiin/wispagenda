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
