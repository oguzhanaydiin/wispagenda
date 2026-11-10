import { useEffect, useRef, useState, type FormEvent } from "react";
import { WBadge, WButton, WCard, WFormField, WInput, WModal, WSelect } from "wispui";
import { kindColor, looseTasks, todayBlocks, type Block, type BlockKind, type BlockStatus, type Task } from "../sample";

export function TodayPage() {
  const now = useMinuteClock();
  const [blocks, setBlocks] = useState(todayBlocks);
  const [tasks, setTasks] = useState(looseTasks);
  const [addOpen, setAddOpen] = useState(false);
  const [scheduling, setScheduling] = useState<Task | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStart, setModalStart] = useState("");
  const [modalEnd, setModalEnd] = useState("");
  const [modalTag, setModalTag] = useState<BlockKind>("Focus");
  const label = formatClock(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = (block: Block) => block.status !== "done" && block.status !== "skipped";
  const holdsNow = (block: Block) => nowMinutes >= toMinutes(block.time) && nowMinutes < toMinutes(block.end);
  const active = blocks.find((block) => isOpen(block) && holdsNow(block));
  const next = blocks.find((block) => isOpen(block) && toMinutes(block.time) > nowMinutes);
  const summary = active ? `Now · ${active.title}` : next ? `Next · ${next.time}–${next.end} ${next.title}` : "The day is done.";

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const span = rangeFrom(modalStart, modalEnd);
    if (scheduling) {
      if (!span) return;
      const block: Block = {
        id: crypto.randomUUID(),
        ...span,
        title: scheduling.title,
        space: scheduling.space,
        kind: modalTag,
      };
      setBlocks((items) => [...items, block].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)));
      setTasks((items) => items.filter((item) => item.id !== scheduling.id));
      setScheduling(null);
      return;
    }
    const title = modalTitle.trim();
    if (!title) return;
    if (span) {
      const block: Block = { id: crypto.randomUUID(), ...span, title, space: "", kind: modalTag };
      setBlocks((items) => [...items, block].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)));
    } else {
      const task: Task = { id: crypto.randomUUID(), title, space: "" };
      setTasks((items) => [...items, task]);
    }
    setAddOpen(false);
  }

  function openAdd() {
    setScheduling(null);
    setModalTitle("");
    setModalStart("");
    setModalEnd("");
    setModalTag("Focus");
    setAddOpen(true);
  }

  function openSchedule(task: Task) {
    setAddOpen(false);
    setModalStart("");
    setModalEnd("");
    setModalTag("Focus");
    setScheduling(task);
  }

  function setBlockStatus(id: string, status: BlockStatus) {
    setBlocks((items) =>
      items.map((item) => (item.id === id ? { ...item, status: item.status === status ? undefined : status } : item)),
    );
  }

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <WCard title="On the clock" description={summary} ui={{ body: "p-0" }}>
          <DayGrid
            blocks={blocks}
            nowMinutes={nowMinutes}
            label={label}
            onDone={(id) => setBlockStatus(id, "done")}
            onSkip={(id) => setBlockStatus(id, "skipped")}
          />
        </WCard>

        <WCard title="Not scheduled" description="A time puts it on the day." ui={{ body: "p-0" }}>
          {tasks.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-400">Nothing waiting.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 last:border-b-0 dark:border-neutral-800">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{task.title}</div>
                    {task.space ? (
                      <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{task.space}</div>
                    ) : null}
                  </div>
                  <WButton size="sm" variant="subtle" color="neutral" onClick={() => openSchedule(task)}>
                    Schedule
                  </WButton>
                </li>
              ))}
            </ul>
          )}
        </WCard>
      </div>

      <WButton
        icon="plus"
        aria-label="Add"
        onClick={openAdd}
        className="fixed right-5 bottom-5 z-30 shadow-lg"
        style={{ width: 56, height: 56, padding: 0, borderRadius: 9999 }}
      />
      <WModal
        open={addOpen || scheduling !== null}
        onOpenChange={(open) => {
          if (open) return;
          setAddOpen(false);
          setScheduling(null);
        }}
        size="sm"
        title={scheduling ? "Schedule" : "Add"}
        description={scheduling ? scheduling.title : "A start and end put it on the day. Leave both empty and it stays off the clock."}
        footer={({ close }) => (
          <>
            <WButton color="neutral" variant="ghost" onClick={close}>
              Cancel
            </WButton>
            <WButton type="submit" form="add-item" icon="plus">
              {scheduling ? "Schedule" : "Add"}
            </WButton>
          </>
        )}
      >
        <form id="add-item" className="space-y-4" onSubmit={addItem}>
          {scheduling ? null : (
            <WFormField label="Title">
              <WInput
                required
                autoFocus
                aria-label="Title"
                placeholder="What needs doing"
                value={modalTitle}
                onChange={(event) => setModalTitle(event.currentTarget.value)}
              />
            </WFormField>
          )}
          <div className="grid grid-cols-2 gap-3">
            <WFormField label="Starts" hint={scheduling ? undefined : "Optional"}>
              <WInput
                type="time"
                required={scheduling !== null}
                autoFocus={scheduling !== null}
                aria-label="Starts"
                value={modalStart}
                onChange={(event) => setModalStart(event.currentTarget.value)}
              />
            </WFormField>
            <WFormField label="Ends" hint="Optional">
              <WInput
                type="time"
                aria-label="Ends"
                value={modalEnd}
                onChange={(event) => setModalEnd(event.currentTarget.value)}
              />
            </WFormField>
          </div>
          <WFormField label="Tag">
            <WSelect
              aria-label="Tag"
              items={tags}
              value={modalTag}
              onChange={(event) => setModalTag(event.currentTarget.value as BlockKind)}
            />
          </WFormField>
        </form>
      </WModal>
    </>
  );
}

const HOUR = 76;
const TOP = 14;
const EDGE = 36;

const kindBlock: Record<BlockKind, string> = {
  Class: "border-info-500/40 bg-info-500/15",
  Focus: "border-primary-500/40 bg-primary-500/15",
  Meeting: "border-secondary-500/40 bg-secondary-500/15",
  Break: "border-neutral-400/50 bg-neutral-500/10",
};

function DayGrid({
  blocks,
  nowMinutes,
  label,
  onDone,
  onSkip,
}: {
  blocks: Block[];
  nowMinutes: number;
  label: string;
  onDone: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const nowRef = useRef<HTMLDivElement>(null);
  const placed = placeBlocks(blocks);
  const { start, end } = dayBounds(blocks, nowMinutes);
  const hours: number[] = [];
  for (let hour = start / 60; hour < end / 60; hour += 1) hours.push(hour);
  const edge = nowMinutes < start ? "top" : nowMinutes > end ? "bottom" : "inside";
  const y = (minutes: number) => (edge === "top" ? EDGE : 0) + TOP + ((minutes - start) / 60) * HOUR;
  const nowTop = edge === "top" ? 14 : edge === "bottom" ? y(end) + 22 : y(nowMinutes);

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="relative" style={{ height: y(end) + (edge === "bottom" ? EDGE : 12) }}>
      {hours.map((hour) => {
        const hidden = edge === "inside" && Math.abs(hour * 60 - nowMinutes) < 18;
        return (
          <div key={hour} className="absolute right-0 left-0" style={{ top: y(hour * 60) }}>
            <div className="absolute top-0 left-0 w-14 -translate-y-1/2 pr-2 text-right text-[11px] tabular-nums text-neutral-400">
              {hidden ? null : `${pad(hour)}:00`}
            </div>
            <div className="absolute top-0 right-0 left-14 border-t border-neutral-200 dark:border-neutral-800" />
            <div className="absolute right-0 left-14 border-t border-dashed border-neutral-200/80 dark:border-neutral-800" style={{ top: HOUR / 2 }} />
          </div>
        );
      })}
      <div className="absolute right-0 left-0" style={{ top: y(end) }}>
        <div className="absolute top-0 left-0 w-14 -translate-y-1/2 pr-2 text-right text-[11px] tabular-nums text-neutral-400">
          {`${pad(end / 60)}:00`}
        </div>
        <div className="absolute top-0 right-0 left-14 border-t border-neutral-200 dark:border-neutral-800" />
      </div>

      {placed.map(({ block, col, cols }) => {
        const start = toMinutes(block.time);
        const end = toMinutes(block.end);
        const height = Math.max(((end - start) / 60) * HOUR - 3, 22);
        const open = block.status !== "done" && block.status !== "skipped";
        const current = open && nowMinutes >= start && nowMinutes < end;
        const quiet = !open || end <= nowMinutes;
        const roomy = height >= 48;
        const detail = [block.space, block.status === "done" ? "Done" : block.status === "skipped" ? "Skipped" : ""]
          .filter(Boolean)
          .join(" · ");
        return (
          <div
            key={block.id}
            className={`absolute overflow-hidden rounded-md border px-2 py-1 ${kindBlock[block.kind]} ${quiet ? "opacity-45" : ""} ${current ? "ring-1 ring-primary-500" : ""}`}
            style={{
              top: y(start) + 1,
              height,
              left: `calc(3.5rem + (100% - 3.5rem) * ${col / cols} + 4px)`,
              width: `calc((100% - 3.5rem) / ${cols} - 8px)`,
            }}
            aria-current={current ? "time" : undefined}
          >
            <div className="flex min-w-0 items-center gap-2 pr-14">
              <div className={`min-w-0 flex-1 truncate text-sm ${quiet ? "font-normal" : "font-medium"}`}>{block.title}</div>
              <WBadge color={kindColor[block.kind]} variant="subtle" size="sm">
                {block.kind}
              </WBadge>
            </div>
            {roomy ? (
              <div className="truncate pr-14 text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                {block.time}–{block.end}
              </div>
            ) : null}
            {roomy && detail ? <div className="truncate pr-14 text-xs text-neutral-400">{detail}</div> : null}
            <div className="absolute top-1 right-1 flex gap-0.5">
              <WButton
                size="sm"
                icon="check"
                aria-label={block.status === "done" ? "Mark not done" : "Done"}
                variant={block.status === "done" ? "subtle" : "ghost"}
                color={block.status === "done" ? "success" : "neutral"}
                onClick={() => onDone(block.id)}
              />
              <WButton
                size="sm"
                icon="x"
                aria-label={block.status === "skipped" ? "Undo skip" : "Skip"}
                variant={block.status === "skipped" ? "subtle" : "ghost"}
                color="neutral"
                onClick={() => onSkip(block.id)}
              />
            </div>
          </div>
        );
      })}

      <div
        ref={nowRef}
        className="pointer-events-none absolute right-0 left-14 z-20"
        style={{ top: nowTop }}
        aria-current="time"
      >
        <span className="absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500" />
        <span className="absolute inset-x-0 top-0 h-0.5 -translate-y-1/2 bg-primary-500" />
      </div>
      <div className="absolute left-0 z-20 w-14 -translate-y-1/2 pr-2 text-right" style={{ top: nowTop }}>
        <NowTime time={label} />
      </div>
    </div>
  );
}

function NowTime({ time }: { time: string }) {
  return (
    <time
      dateTime={time}
      className="inline-flex rounded bg-white px-1 py-0.5 text-[10px] font-semibold tabular-nums leading-none text-primary-600 ring-1 ring-primary-500/40 dark:bg-neutral-900 dark:text-primary-300"
    >
      {time}
    </time>
  );
}

function dayBounds(blocks: Block[], nowMinutes: number) {
  if (blocks.length === 0) {
    const hour = Math.floor(nowMinutes / 60) * 60;
    return { start: Math.max(0, hour - 60), end: Math.min(24 * 60, hour + 120) };
  }
  const first = Math.min(...blocks.map((block) => toMinutes(block.time)));
  const last = Math.max(...blocks.map((block) => toMinutes(block.end)));
  const start = Math.max(0, Math.floor(first / 60) * 60 - 60);
  const end = Math.min(24 * 60, Math.floor(last / 60) * 60 + 60);
  return { start, end: Math.max(end, start + 60) };
}

function placeBlocks(blocks: Block[]) {
  const sorted = [...blocks].sort((a, b) => toMinutes(a.time) - toMinutes(b.time) || toMinutes(a.end) - toMinutes(b.end));
  const placed: { block: Block; col: number; cols: number }[] = [];
  let cluster: Block[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const columns: number[] = [];
    const columnOf = new Map<string, number>();
    for (const block of cluster) {
      const start = toMinutes(block.time);
      let col = columns.findIndex((end) => end <= start);
      if (col === -1) {
        col = columns.length;
        columns.push(toMinutes(block.end));
      } else columns[col] = toMinutes(block.end);
      columnOf.set(block.id, col);
    }
    for (const block of cluster) placed.push({ block, col: columnOf.get(block.id) ?? 0, cols: Math.max(columns.length, 1) });
    cluster = [];
    clusterEnd = -1;
  };

  for (const block of sorted) {
    const start = toMinutes(block.time);
    if (cluster.length && start >= clusterEnd) flush();
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, toMinutes(block.end));
  }
  if (cluster.length) flush();
  return placed;
}

const tags: BlockKind[] = ["Class", "Focus", "Meeting", "Break"];

function rangeFrom(start: string, end: string) {
  const time = start.slice(0, 5);
  if (!time) return null;
  let finish = end.slice(0, 5);
  if (!finish || toMinutes(finish) <= toMinutes(time)) finish = fromMinutes(Math.min(toMinutes(time) + 60, 23 * 60 + 59));
  return { time, end: finish };
}

function fromMinutes(total: number) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;

    const sync = () => {
      const next = new Date();
      setNow((prev) => (sameMinute(prev, next) ? prev : next));
    };

    const arm = () => {
      window.clearTimeout(timer);
      if (document.hidden) return;
      const wait = 60_000 - (Date.now() % 60_000);
      timer = window.setTimeout(() => {
        sync();
        arm();
      }, wait);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        return;
      }
      sync();
      arm();
    };

    arm();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return now;
}

function sameMinute(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate() &&
    left.getHours() === right.getHours() &&
    left.getMinutes() === right.getMinutes()
  );
}

function formatClock(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
