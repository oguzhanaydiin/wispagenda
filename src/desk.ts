export type NoteBox = { id: string; kind: "note"; text: string };
export type ImageBox = { id: string; kind: "image"; src: string; caption: string };
export type DeskBox = NoteBox | ImageBox;

export type DeskTab = {
  id: string;
  name: string;
  boxes: DeskBox[];
};

export type DayDesk = {
  active: string;
  tabs: DeskTab[];
};

const storageKey = "wispagenda-desk";

export function todayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function emptyDesk(): DayDesk {
  const id = crypto.randomUUID();
  return { active: id, tabs: [{ id, name: "Notes", boxes: [] }] };
}

export function loadDesk(day: string): DayDesk {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptyDesk();
    const saved = JSON.parse(raw) as Record<string, DayDesk>;
    const desk = saved[day];
    if (!desk?.tabs?.length) return emptyDesk();
    const active = desk.tabs.some((tab) => tab.id === desk.active) ? desk.active : desk.tabs[0].id;
    return { active, tabs: desk.tabs };
  } catch {
    return emptyDesk();
  }
}

export function saveDesk(day: string, desk: DayDesk) {
  const raw = localStorage.getItem(storageKey);
  const saved = raw ? (JSON.parse(raw) as Record<string, DayDesk>) : {};
  saved[day] = desk;
  localStorage.setItem(storageKey, JSON.stringify(saved));
}

export function shrinkImage(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const longest = Math.max(image.width, image.height);
      const scale = Math.min(1, 1400 / longest);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read the picture."));
        return;
      }
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the picture."));
    };
    image.src = url;
  });
}
