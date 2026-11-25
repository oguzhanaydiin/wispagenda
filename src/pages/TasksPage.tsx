import { useState } from "react";
import { WButton, WCard, WInput } from "wispui";
import { useDay } from "../day";
import type { BlockKind, Task } from "../sample";
import { MoveDialog, TimeDialog } from "../TimeDialog";

export function TasksPage() {
  const { tasks, date, addTask, removeTask, setTaskStatus, moveTask, schedule } = useDay();
  const [title, setTitle] = useState("");
  const [scheduling, setScheduling] = useState<Task | null>(null);
  const [moving, setMoving] = useState<Task | null>(null);

  function save(value: { title: string; start: string; end: string; kind: BlockKind; date?: string }) {
    if (!scheduling) return;
    const saved = schedule({
      title: scheduling.title,
      space: scheduling.space,
      start: value.start,
      end: value.end,
      kind: value.kind,
      taskId: scheduling.id,
      date: value.date ?? date,
    });
    if (saved) setScheduling(null);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addTask(title);
          setTitle("");
        }}
      >
        <div className="min-w-0 flex-1">
          <WInput
            aria-label="New task"
            placeholder="Add something loose"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </div>
        <WButton type="submit" icon="plus" disabled={!title.trim()}>
          Add
        </WButton>
      </form>

      <WCard title="Loose" description="Give one a time and it joins that day." ui={{ body: "p-0" }}>
        {tasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-neutral-400">Nothing waiting.</p>
        ) : (
          <ul>
            {orderedTasks(tasks).map((task) => (
              <li key={task.id} className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 last:border-b-0 dark:border-neutral-800">
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm ${task.status === "done" ? "text-neutral-400" : "font-medium"}`}>{task.title}</div>
                  {task.space ? <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{task.space}</div> : null}
                </div>
                <WButton
                  size="sm"
                  icon="check"
                  aria-label={task.status === "done" ? `Mark ${task.title} not done` : `Done ${task.title}`}
                  variant={task.status === "done" ? "subtle" : "ghost"}
                  color={task.status === "done" ? "success" : "neutral"}
                  onClick={() => setTaskStatus(task.id)}
                />
                <WButton size="sm" variant="subtle" color="neutral" onClick={() => setScheduling(task)}>
                  Schedule
                </WButton>
                <WButton size="sm" variant="subtle" color="neutral" onClick={() => setMoving(task)}>
                  Move
                </WButton>
                <WButton
                  size="sm"
                  variant="subtle"
                  color="error"
                  icon="trash"
                  aria-label={`Remove ${task.title}`}
                  onClick={() => removeTask(task.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </WCard>

      <TimeDialog
        open={scheduling !== null}
        title="Schedule"
        description={scheduling?.title ?? ""}
        titleEditable={false}
        timeRequired
        initialDate={date}
        submitLabel="Schedule"
        onOpenChange={(open) => {
          if (!open) setScheduling(null);
        }}
        onSubmit={save}
      />
      <MoveDialog
        open={moving !== null}
        initialDate={date}
        description={moving ? `${moving.title} stays loose.` : ""}
        onOpenChange={(open) => {
          if (!open) setMoving(null);
        }}
        onMove={(day) => {
          if (!moving) return;
          if (moveTask(moving.id, day)) setMoving(null);
        }}
      />
    </div>
  );
}

function orderedTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
}
