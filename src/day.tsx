import { createContext, useContext, useState, type ReactNode } from "react";
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

type DayValue = {
  blocks: Block[];
  tasks: Task[];
  now: Date;
  setStatus: (id: string, status: BlockStatus) => void;
  addTask: (title: string, space?: string) => void;
  schedule: (input: ScheduleInput) => boolean;
};

const DayContext = createContext<DayValue | null>(null);

export function DayProvider({ children }: { children: ReactNode }) {
  const now = useMinuteClock();
  const [blocks, setBlocks] = useState(todayBlocks);
  const [tasks, setTasks] = useState(looseTasks);

  const value: DayValue = {
    blocks,
    tasks,
    now,
    setStatus(id, status) {
      setBlocks((items) =>
        items.map((item) => (item.id === id ? { ...item, status: item.status === status ? undefined : status } : item)),
      );
    },
    addTask(title, space = "") {
      const trimmed = title.trim();
      if (!trimmed) return;
      setTasks((items) => [...items, { id: crypto.randomUUID(), title: trimmed, space }]);
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
      setBlocks((items) => [...items, block].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)));
      if (input.taskId) setTasks((items) => items.filter((item) => item.id !== input.taskId));
      return true;
    },
  };

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

export function useDay() {
  const value = useContext(DayContext);
  if (!value) throw new Error("useDay must be used inside DayProvider");
  return value;
}
