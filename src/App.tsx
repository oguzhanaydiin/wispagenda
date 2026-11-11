import { useEffect, useState } from "react";
import { DeskPage } from "./pages/DeskPage";
import { ReviewPage } from "./pages/ReviewPage";
import { TasksPage } from "./pages/TasksPage";
import { TodayPage } from "./pages/TodayPage";
import { WeekPage } from "./pages/WeekPage";
import { AppShell } from "./shell/AppShell";

const pages = {
  "/": { title: "Today", description: "What is on the clock, and what is still loose.", page: TodayPage },
  "/desk": { title: "Desk", description: "Notes and pictures for this day.", page: DeskPage },
  "/week": { title: "Week", description: "This week, with today filled in.", page: WeekPage },
  "/tasks": { title: "Tasks", description: "What is still loose.", page: TasksPage },
  "/review": { title: "Review", description: "How the day went.", page: ReviewPage },
} as const;

function App() {
  const path = usePath();
  const current = pages[path as keyof typeof pages] ?? pages["/"];
  const Page = current.page;

  return (
    <AppShell title={current.title} description={current.description}>
      <Page />
    </AppShell>
  );
}

function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return path;
}

export default App;
