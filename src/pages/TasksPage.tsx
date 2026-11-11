import { useState } from "react";
import { WButton, WCard, WInput } from "wispui";
import { useDay } from "../day";
import type { BlockKind, Task } from "../sample";
import { TimeDialog } from "../TimeDialog";

export function TasksPage() {
  const { tasks, addTask, schedule } = useDay();
  const [title, setTitle] = useState("");
  const [scheduling, setScheduling] = useState<Task | null>(null);

  function save(value: { title: string; start: string; end: string; kind: BlockKind }) {
    if (!scheduling) return;
    const saved = schedule({
      title: scheduling.title,
      space: scheduling.space,
      start: value.start,
      end: value.end,
      kind: value.kind,
      taskId: scheduling.id,
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

      <WCard title="Loose" description="Give one a time and it joins today." ui={{ body: "p-0" }}>
        {tasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-neutral-400">Nothing waiting.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 last:border-b-0 dark:border-neutral-800">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{task.title}</div>
                  {task.space ? <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{task.space}</div> : null}
                </div>
                <WButton size="sm" variant="subtle" color="neutral" onClick={() => setScheduling(task)}>
                  Schedule
                </WButton>
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
        submitLabel="Schedule"
        onOpenChange={(open) => {
          if (!open) setScheduling(null);
        }}
        onSubmit={save}
      />
    </div>
  );
}
