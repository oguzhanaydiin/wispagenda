import { WCard } from "wispui";
import { useDay } from "../day";
import { todayKey } from "../desk";
import type { Block } from "../sample";
import { toMinutes } from "../time";

export function ReviewPage() {
  const { blocks, tasks, now, date, isToday } = useDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const when = isToday ? "today" : date > todayKey(now) ? "future" : "past";
  const done = blocks.filter((block) => block.status === "done");
  const skipped = blocks.filter((block) => block.status === "skipped");
  const open = blocks.filter((block) => !block.status);
  const unmarked = when === "future" ? [] : when === "past" ? open : open.filter((block) => toMinutes(block.end) <= nowMinutes);
  const ahead = when === "past" ? [] : when === "future" ? open : open.filter((block) => toMinutes(block.end) > nowMinutes);
  const finished = tasks.filter((task) => task.status === "done");
  const waiting = tasks.filter((task) => task.status !== "done");
  const closed = blocks.length > 0 && done.length === blocks.length && waiting.length === 0;
  const title = closed ? "The day is closed." : when === "future" ? "What is planned" : when === "past" ? "How the day went" : "The day so far";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <WCard title={title} description={summary(when, done.length + finished.length, skipped.length, unmarked.length, ahead.length, waiting.length)}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Group
            title="Done"
            items={[...done.map(entry), ...finished.map((task) => ({ id: task.id, label: task.title }))]}
            empty="Nothing marked done."
          />
          <Group title="Skipped" items={skipped.map(entry)} empty="Nothing skipped." />
          <Group title="Unmarked" items={unmarked.map(entry)} empty="Nothing slipped past." />
          <Group title="Still ahead" items={ahead.map(entry)} empty="Nothing left on the clock." />
          <Group title="Loose" items={waiting.map((task) => ({ id: task.id, label: task.title }))} empty="Nothing waiting." />
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

function summary(when: "today" | "past" | "future", done: number, skipped: number, unmarked: number, ahead: number, loose: number) {
  if (when === "past") return `${done} done · ${skipped} skipped · ${unmarked} unmarked · ${loose} loose`;
  if (when === "future") return `${ahead} planned · ${done} done · ${skipped} skipped · ${loose} loose`;
  return `${done} done · ${skipped} skipped · ${ahead} still ahead · ${loose} loose`;
}
