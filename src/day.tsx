import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { todayKey } from "./desk";
import { emptyDay, isDayKey, loadDays, saveDays, shiftKey, type SavedDay } from "./days";
import { looseTasks, todayBlocks, type Block, type BlockKind, type BlockStatus, type Task } from "./sample";
import { rangeFrom, toMinutes, useMinuteClock } from "./time";

type ScheduleInput = {
  title: string;
  space?: string;
  start: string;
  end: string;
  kind: BlockKind;
  taskId?: string;
  date?: string;
};

type BlockInput = {
  title: string;
  start: string;
  end: string;
  kind: BlockKind;
  date?: string;
};

type DayValue = {
  blocks: Block[];
  tasks: Task[];
  days: Record<string, SavedDay>;
  now: Date;
  date: string;
  isToday: boolean;
  selectDate: (key: string) => void;
  previous: () => void;
  next: () => void;
  goToday: () => void;
  setStatus: (id: string, status: BlockStatus) => void;
  addTask: (title: string, space?: string, date?: string) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, date: string) => boolean;
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
    days,
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
    addTask(title, space = "", toDate) {
      const trimmed = title.trim();
      if (!trimmed) return;
      const target = picked(toDate, date);
      const task: Task = { id: crypto.randomUUID(), title: trimmed, space };
      setDays((all) => {
        const there = all[target] ?? emptyDay();
        return { ...all, [target]: { ...there, tasks: [...there.tasks, task] } };
      });
    },
    removeTask(id) {
      change((day) => ({ ...day, tasks: day.tasks.filter((item) => item.id !== id) }));
    },
    moveTask(id, toDate) {
      if (!isDayKey(toDate)) return false;
      const source = days[date] ?? emptyDay();
      if (!source.tasks.some((item) => item.id === id)) return false;
      if (toDate === date) return true;
      setDays((all) => {
        const from = all[date] ?? emptyDay();
        const task = from.tasks.find((item) => item.id === id);
        if (!task) return all;
        const there = all[toDate] ?? emptyDay();
        return {
          ...all,
          [date]: { ...from, tasks: from.tasks.filter((item) => item.id !== id) },
          [toDate]: { ...there, tasks: [...there.tasks.filter((item) => item.id !== id), task] },
        };
      });
      return true;
    },
    schedule(input) {
      const span = rangeFrom(input.start, input.end);
      const title = input.title.trim();
      if (!span || !title) return false;
      const target = picked(input.date, date);
      const block: Block = {
        id: crypto.randomUUID(),
        ...span,
        title,
        space: input.space ?? "",
        kind: input.kind,
      };
      setDays((all) => {
        const source = all[date] ?? emptyDay();
        const tasks = input.taskId ? source.tasks.filter((item) => item.id !== input.taskId) : source.tasks;
        if (target === date) return { ...all, [date]: withBlock({ ...source, tasks }, block) };
        const there = all[target] ?? emptyDay();
        return {
          ...all,
          [date]: { ...source, tasks },
          [target]: withBlock(there, block),
        };
      });
      return true;
    },
    updateBlock(id, input) {
      const span = rangeFrom(input.start, input.end);
      const title = input.title.trim();
      if (!span || !title) return false;
      const source = days[date] ?? emptyDay();
      const existing = source.blocks.find((item) => item.id === id);
      if (!existing) return false;
      const target = picked(input.date, date);
      const next: Block = { ...existing, ...span, title, kind: input.kind };
      setDays((all) => {
        const from = all[date] ?? emptyDay();
        if (!from.blocks.some((item) => item.id === id)) return all;
        if (target === date) return { ...all, [date]: withBlock(from, next) };
        const there = all[target] ?? emptyDay();
        return {
          ...all,
          [date]: { ...from, blocks: from.blocks.filter((item) => item.id !== id) },
          [target]: withBlock(there, next),
        };
      });
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

function picked(key: string | undefined, fallback: string) {
  return key && isDayKey(key) ? key : fallback;
}

function withBlock(day: SavedDay, block: Block) {
  return {
    ...day,
    blocks: [...day.blocks.filter((item) => item.id !== block.id), block].sort(
      (a, b) => toMinutes(a.time) - toMinutes(b.time),
    ),
  };
}
