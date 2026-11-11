import { WCard } from "wispui";
import { useDay } from "../day";
import type { Block } from "../sample";
import { toMinutes } from "../time";

export function ReviewPage() {
  const { blocks, tasks, now } = useDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const done = blocks.filter((block) => block.status === "done");
  const skipped = blocks.filter((block) => block.status === "skipped");
  const unmarked = blocks.filter((block) => !block.status && toMinutes(block.end) <= nowMinutes);
  const ahead = blocks.filter((block) => !block.status && toMinutes(block.end) > nowMinutes);
  const closed = done.length === blocks.length && tasks.length === 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <WCard title={closed ? "The day is closed." : "The day so far"} description={summary(done.length, skipped.length, ahead.length, tasks.length)}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Group title="Done" items={done.map(entry)} empty="Nothing marked done." />
          <Group title="Skipped" items={skipped.map(entry)} empty="Nothing skipped." />
          <Group title="Unmarked" items={unmarked.map(entry)} empty="Nothing slipped past." />
          <Group title="Still ahead" items={ahead.map(entry)} empty="Nothing left on the clock." />
          <Group title="Loose" items={tasks.map((task) => ({ id: task.id, label: task.title }))} empty="Nothing waiting." />
        </div>
      </WCard>
    </div>
  );
}

function Group({ title, items, empty }: { title: string; items: { id: string; label: string }[]; empty: string }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function entry(block: Block) {
  return { id: block.id, label: `${block.time}–${block.end} ${block.title}` };
}

function summary(done: number, skipped: number, ahead: number, loose: number) {
  return `${done} done · ${skipped} skipped · ${ahead} still ahead · ${loose} loose`;
}
