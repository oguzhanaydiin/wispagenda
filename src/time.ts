import { useEffect, useState } from "react";

export function useMinuteClock() {
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

export function formatClock(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total: number) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function rangeFrom(start: string, end: string) {
  const time = start.slice(0, 5);
  if (!time) return null;
  let finish = end.slice(0, 5);
  if (!finish || toMinutes(finish) <= toMinutes(time)) finish = fromMinutes(Math.min(toMinutes(time) + 60, 23 * 60 + 59));
  return { time, end: finish };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
