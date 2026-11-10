import type { ReactNode } from "react";
import { WNav, WNavMenu } from "wispui";
import { navItems } from "../nav";
import { ThemeButton } from "../theme";

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-dvh bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 md:flex dark:border-neutral-800">
        <div className="px-5 py-5">
          <div className="text-sm font-semibold tracking-tight">Wispagenda</div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Workday</p>
        </div>
        <WNav className="agenda-nav flex-1 overflow-y-auto px-3" color="neutral" items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 md:px-6 dark:border-neutral-800">
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-500 md:hidden dark:text-neutral-400">Wispagenda</p>
            <h1 className="truncate text-base font-semibold">{title}</h1>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden text-sm text-neutral-500 sm:inline dark:text-neutral-400">{today}</span>
            <ThemeButton />
          </div>
        </header>

        <div className="border-b border-neutral-200 px-3 py-2 md:hidden dark:border-neutral-800">
          <WNavMenu
            className="agenda-nav"
            color="neutral"
            items={navItems}
            ui={{ list: "flex-nowrap gap-1 overflow-x-auto" }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
