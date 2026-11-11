import { WBadge, WCard } from "wispui";
import { useDay } from "../day";
import { kindColor, type Block } from "../sample";
export function WeekPage() {
  const { blocks, now } = useDay();
  const days = weekDays(now);

  return (
    <div className="mx-auto max-w-2xl">
      <WCard title="This week" description="Today carries the clock. The other days are still empty." ui={{ body: "p-0" }}>
        <ul>
          {days.map((day) => (
            <li key={day.key} className="border-b border-neutral-200 px-4 py-3 last:border-b-0 dark:border-neutral-800">
              <div className="flex items-baseline gap-3">
                <div className={`w-24 shrink-0 text-sm ${day.today ? "font-semibold" : "text-neutral-500 dark:text-neutral-400"}`}>
                  {day.label}
                </div>
                {day.today ? (
                  <ul className="min-w-0 flex-1 space-y-2">
                    {blocks.map((block) => (
                      <WeekRow key={block.id} block={block} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-400">Nothing yet.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </WCard>
    </div>
  );
}

function WeekRow({ block }: { block: Block }) {
  const quiet = block.status === "done" || block.status === "skipped";
  return (
    <li className={`flex items-center gap-2 text-sm ${quiet ? "text-neutral-400" : ""}`}>
      <span className="w-28 shrink-0 tabular-nums text-neutral-500 dark:text-neutral-400">
        {block.time}–{block.end}
      </span>
      <span className="min-w-0 flex-1 truncate">{block.title}</span>
      <WBadge color={kindColor[block.kind]} variant="subtle" size="sm">
        {block.kind}
      </WBadge>
    </li>
  );
}

function weekDays(now: Date) {
  const start = new Date(now);
  const weekday = start.getDay();
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const today = day.toDateString() === now.toDateString();
    return {
      key: day.toISOString(),
      today,
      label: day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
    };
  });
}
