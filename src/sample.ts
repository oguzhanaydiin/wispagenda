import type { Color } from "wispui";

export type BlockKind = "Class" | "Focus" | "Meeting" | "Break";

export type BlockStatus = "done" | "skipped";

export type Block = {
  id: string;
  time: string;
  end: string;
  title: string;
  space: string;
  kind: BlockKind;
  status?: BlockStatus;
};

export type Task = {
  id: string;
  title: string;
  space: string;
};

export const blockKinds: BlockKind[] = ["Class", "Focus", "Meeting", "Break"];

export const kindColor: Record<BlockKind, Color> = {
  Class: "info",
  Focus: "primary",
  Meeting: "secondary",
  Break: "neutral",
};

export const todayBlocks: Block[] = [
  { id: "lecture", time: "09:00", end: "10:30", title: "Calculus lecture", space: "Calculus", kind: "Class" },
  { id: "problems", time: "10:30", end: "12:00", title: "Problem set", space: "Calculus", kind: "Focus" },
  { id: "lunch", time: "12:00", end: "13:00", title: "Lunch", space: "Break", kind: "Break" },
  { id: "standup", time: "13:00", end: "13:30", title: "Standup", space: "Client work", kind: "Meeting" },
  { id: "report", time: "14:00", end: "16:00", title: "Report draft", space: "Client work", kind: "Focus" },
  { id: "reading", time: "16:00", end: "17:30", title: "Reading", space: "History", kind: "Class" },
];

export const looseTasks: Task[] = [
  { id: "email", title: "Email the professor about office hours", space: "Calculus" },
  { id: "thesis", title: "Outline thesis section 2", space: "Thesis" },
];
