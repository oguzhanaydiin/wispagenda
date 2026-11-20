import { WBadge, WCard } from "wispui";
import { useDay } from "../day";
import { todayKey } from "../desk";
import { kindColor, type Block } from "../sample";

export function WeekPage() {
  const { days, date, now, selectDate } = useDay();
  const week = weekDays(date, now);

  function openDay(key: string) {
    selectDate(key);
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <WCard title="This week" description="Each day keeps its own clock." ui={{ body: "p-0" }}>
        <ul>
          {week.map((day) => {
            const blocks = days[day.key]?.blocks ?? [];
            return (
              <li key={day.key} className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
                <div
                  role="button"
                  tabIndex={0}
                  className={`flex w-full items-baseline gap-3 px-4 py-3 text-left ${day.selected ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
                  onClick={() => openDay(day.key)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    openDay(day.key);
                  }}
                >
                  <div className={`w-24 shrink-0 text-sm ${day.today ? "font-semibold" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {day.label}
                  </div>
                  {blocks.length === 0 ? (
                    <p className="text-sm text-neutral-400">Nothing yet.</p>
                  ) : (
                    <ul className="min-w-0 flex-1 space-y-2">
                      {blocks.map((block) => (
                        <WeekRow key={block.id} block={block} />
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
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

function weekDays(selected: string, now: Date) {
  const [year, month, day] = selected.split("-").map(Number);
  const anchor = new Date(year, month - 1, day);
  const start = new Date(anchor);
  const weekday = start.getDay();
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  const today = todayKey(now);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = todayKey(date);
    return {
      key,
      today: key === today,
      selected: key === selected,
      label: date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
    };
  });
}
