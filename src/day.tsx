import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { todayKey } from "./desk";
import { emptyDay, loadDays, saveDays, shiftKey, type SavedDay } from "./days";
import { looseTasks, todayBlocks, type Block, type BlockKind, type BlockStatus, type Task } from "./sample";
import { rangeFrom, toMinutes, useMinuteClock } from "./time";

type ScheduleInput = {
  title: string;
  space?: string;
  start: string;
  end: string;
  kind: BlockKind;
  taskId?: string;
};

type BlockInput = {
  title: string;
  start: string;
  end: string;
  kind: BlockKind;
};

type DayValue = {
  blocks: Block[];
  tasks: Task[];
  now: Date;
  date: string;
  isToday: boolean;
  selectDate: (key: string) => void;
  previous: () => void;
  next: () => void;
  goToday: () => void;
  setStatus: (id: string, status: BlockStatus) => void;
  addTask: (title: string, space?: string) => void;
  removeTask: (id: string) => void;
  schedule: (input: ScheduleInput) => boolean;
  updateBlock: (id: string, input: BlockInput) => boolean;
  removeBlock: (id: string) => void;
};

const DayContext = createContext<DayValue | null>(null);

function seedToday(days: Record<string, SavedDay>, today: string) {
  if (days[today]) return days;
  return {
    ...days,
    [today]: {
      blocks: todayBlocks.map((block) => ({ ...block })),
      tasks: looseTasks.map((task) => ({ ...task })),
    },
  };
}

export function DayProvider({ children }: { children: ReactNode }) {
  const now = useMinuteClock();
  const today = todayKey(now);
  const [date, setDate] = useState(() => todayKey());
  const [days, setDays] = useState(() => seedToday(loadDays(), todayKey()));
  const current = days[date] ?? emptyDay();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveDays(days);
      } catch {
        // The clock is small. A failed write leaves the open day in memory.
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [days]);

  function change(recipe: (day: SavedDay) => SavedDay) {
    setDays((all) => ({ ...all, [date]: recipe(all[date] ?? emptyDay()) }));
  }

  const value: DayValue = {
    blocks: current.blocks,
    tasks: current.tasks,
    now,
    date,
    isToday: date === today,
    selectDate(key) {
      setDate(key);
    },
    previous() {
      setDate((current) => shiftKey(current, -1));
    },
    next() {
      setDate((current) => shiftKey(current, 1));
    },
    goToday() {
      setDate(todayKey());
    },
    setStatus(id, status) {
      change((day) => ({
        ...day,
        blocks: day.blocks.map((item) =>
          item.id === id ? { ...item, status: item.status === status ? undefined : status } : item,
        ),
      }));
    },
    addTask(title, space = "") {
      const trimmed = title.trim();
      if (!trimmed) return;
      change((day) => ({ ...day, tasks: [...day.tasks, { id: crypto.randomUUID(), title: trimmed, space }] }));
    },
    removeTask(id) {
      change((day) => ({ ...day, tasks: day.tasks.filter((item) => item.id !== id) }));
    },
    schedule(input) {
      const span = rangeFrom(input.start, input.end);
      const title = input.title.trim();
      if (!span || !title) return false;
      const block: Block = {
        id: crypto.randomUUID(),
        ...span,
        title,
        space: input.space ?? "",
        kind: input.kind,
      };
      change((day) => ({
        ...day,
        blocks: [...day.blocks, block].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
        tasks: input.taskId ? day.tasks.filter((item) => item.id !== input.taskId) : day.tasks,
      }));
      return true;
    },
    updateBlock(id, input) {
      const span = rangeFrom(input.start, input.end);
      const title = input.title.trim();
      if (!span || !title) return false;
      change((day) => ({
        ...day,
        blocks: day.blocks
          .map((item) => (item.id === id ? { ...item, ...span, title, kind: input.kind } : item))
          .sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
      }));
      return true;
    },
    removeBlock(id) {
      change((day) => ({ ...day, blocks: day.blocks.filter((item) => item.id !== id) }));
    },
  };

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

export function useDay() {
  const value = useContext(DayContext);
  if (!value) throw new Error("useDay must be used inside DayProvider");
  return value;
}
