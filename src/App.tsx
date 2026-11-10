import { TodayPage } from "./pages/TodayPage";
import { AppShell } from "./shell/AppShell";

function App() {
  return (
    <AppShell title="Today" description="What is on the clock, and what is still loose.">
      <TodayPage />
    </AppShell>
  );
}

export default App;
