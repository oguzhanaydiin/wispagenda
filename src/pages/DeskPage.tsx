import { useEffect, useRef, useState, type DragEvent } from "react";
import { WButton, WModal } from "wispui";
import { useDay } from "../day";
import {
  emptyDesk,
  loadDesk,
  saveDesk,
  shrinkImage,
  todayKey,
  type DayDesk,
  type DeskBox,
  type DeskTab,
  type ImageBox,
  type NoteBox,
} from "../desk";
import { TimeDialog } from "../TimeDialog";

const boxType = "application/x-wisp-box";

export function DeskPage() {
  const day = useRef(todayKey()).current;
  const [desk, setDesk] = useState<DayDesk>(() => loadDesk(day));
  const [over, setOver] = useState(false);
  const [notice, setNotice] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overBox, setOverBox] = useState<{ id: string; place: "before" | "after" } | null>(null);
  const [overTab, setOverTab] = useState<string | null>(null);
  const [clockNote, setClockNote] = useState<NoteBox | null>(null);
  const [preview, setPreview] = useState<ImageBox | null>(null);
  const { schedule } = useDay();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const active = desk.tabs.find((tab) => tab.id === desk.active) ?? desk.tabs[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveDesk(day, desk);
      } catch {
        setNotice("The day is full, so the latest change could not be kept.");
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [day, desk]);

  useEffect(() => {
    if (!focusId) return;
    document.getElementById(`box-${focusId}`)?.focus();
    setFocusId(null);
  }, [focusId, desk.active]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = [...(event.clipboardData?.items ?? [])];
      const image = items.find((item) => item.type.startsWith("image/"));
      if (image) {
        const file = image.getAsFile();
        if (!file) return;
        event.preventDefault();
        void addImages([file]);
        return;
      }
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const text = event.clipboardData?.getData("text/plain") ?? "";
      if (!text.trim()) return;
      event.preventDefault();
      addNote(text);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [desk.active]);

  function update(recipe: (current: DayDesk) => DayDesk) {
    setNotice("");
    setDesk(recipe);
  }

  function addNote(text = "") {
    const box: DeskBox = { id: crypto.randomUUID(), kind: "note", text };
    update((current) => place(current, box));
    setFocusId(box.id);
  }

  async function addImages(files: Blob[]) {
    const pictures = files.filter((file) => file.type.startsWith("image/"));
    if (!pictures.length) return;
    try {
      const boxes: DeskBox[] = [];
      for (const file of pictures) {
        boxes.push({ id: crypto.randomUUID(), kind: "image", src: await shrinkImage(file), caption: "" });
      }
      update((current) => ({
        ...current,
        tabs: current.tabs.map((tab) => (tab.id === current.active ? { ...tab, boxes: [...boxes, ...tab.boxes] } : tab)),
      }));
    } catch {
      setNotice("That picture could not be read.");
    }
  }

  function addTab() {
    const id = crypto.randomUUID();
    update((current) => ({
      active: id,
      tabs: [...current.tabs, { id, name: `Notes ${current.tabs.length + 1}`, boxes: [] }],
    }));
  }

  function closeTab(id: string) {
    update((current) => {
      const tabs = current.tabs.filter((tab) => tab.id !== id);
      if (!tabs.length) return emptyDesk();
      return { active: current.active === id ? tabs[0].id : current.active, tabs };
    });
  }

  function renameTab(id: string, name: string) {
    update((current) => ({
      ...current,
      tabs: current.tabs.map((tab) => (tab.id === id ? { ...tab, name } : tab)),
    }));
  }

  function changeBox(id: string, next: DeskBox) {
    update((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === current.active ? { ...tab, boxes: tab.boxes.map((box) => (box.id === id ? next : box)) } : tab,
      ),
    }));
  }

  function dropBox(id: string, targetId?: string, place: "before" | "after" = "before", tabId?: string) {
    if (targetId && id === targetId) return;
    update((current) => {
      let moving: DeskBox | undefined;
      const tabs = current.tabs.map((tab) => {
        const found = tab.boxes.find((box) => box.id === id);
        if (found) moving = found;
        return { ...tab, boxes: tab.boxes.filter((box) => box.id !== id) };
      });
      if (!moving) return current;
      const destination = tabId ?? current.active;
      return {
        ...current,
        active: tabId ? destination : current.active,
        tabs: tabs.map((tab) => {
          if (tab.id !== destination) return tab;
          if (!targetId) return { ...tab, boxes: [...tab.boxes, moving as DeskBox] };
          const index = tab.boxes.findIndex((box) => box.id === targetId);
          const boxes = [...tab.boxes];
          const at = index < 0 ? boxes.length : place === "after" ? index + 1 : index;
          boxes.splice(at, 0, moving as DeskBox);
          return { ...tab, boxes };
        }),
      };
    });
    setDragId(null);
    setOverBox(null);
    setOverTab(null);
  }

  function removeBox(id: string) {
    update((current) => ({
      ...current,
      tabs: current.tabs.map((tab) =>
        tab.id === current.active ? { ...tab, boxes: tab.boxes.filter((box) => box.id !== id) } : tab,
      ),
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {desk.tabs.map((tab) => (
            <TabChip
              key={tab.id}
              tab={tab}
              selected={tab.id === active.id}
              closable={desk.tabs.length > 1}
              armed={overTab === tab.id}
              onSelect={() => update((current) => ({ ...current, active: tab.id }))}
              onRename={(name) => renameTab(tab.id, name)}
              onClose={() => closeTab(tab.id)}
              onDragOver={(event) => {
                if (!isBoxDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                setOverTab(tab.id);
              }}
              onDrop={(event) => {
                if (!isBoxDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                dropBox(event.dataTransfer.getData(boxType), undefined, "before", tab.id);
              }}
            />
          ))}
          <WButton size="sm" variant="ghost" color="neutral" icon="plus" aria-label="New tab" onClick={addTab} />
        </div>
        <WButton size="sm" variant="subtle" color="neutral" onClick={() => addNote()}>
          Note
        </WButton>
        <WButton size="sm" variant="subtle" color="neutral" onClick={() => fileRef.current?.click()}>
          Picture
        </WButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = [...(event.currentTarget.files ?? [])];
            event.currentTarget.value = "";
            void addImages(files);
          }}
        />
      </div>

      <div
        className={`min-h-[28rem] rounded-xl ${over ? "bg-primary-500/5 ring-2 ring-primary-500/40" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (isBoxDrag(event.dataTransfer)) return;
          dragDepth.current += 1;
          setOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setOver(false);
          }
        }}
        onDrop={(event) => {
          if (event.defaultPrevented) return;
          event.preventDefault();
          dragDepth.current = 0;
          setOver(false);
          if (isBoxDrag(event.dataTransfer)) {
            dropBox(event.dataTransfer.getData(boxType));
            return;
          }
          const files = [...event.dataTransfer.files];
          if (files.some((file) => file.type.startsWith("image/"))) {
            void addImages(files);
            return;
          }
          const text = event.dataTransfer.getData("text/plain");
          if (text.trim()) addNote(text);
        }}
      >
        {active.boxes.length === 0 ? (
          <div className="flex min-h-[28rem] items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 text-center dark:border-neutral-700">
            <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              Paste a note or a picture, or drop a photo here. Drag a box by its handle to reorder it, or drop it on a tab.
            </p>
          </div>
        ) : (
          <ul className="grid items-start gap-4 sm:grid-cols-2">
            {active.boxes.map((box) => (
              <li
                key={box.id}
                className={`rounded-xl border bg-white p-3 dark:bg-neutral-900 ${dragId === box.id ? "opacity-40" : ""} ${overBox?.id === box.id ? "border-primary-500" : "border-neutral-200 dark:border-neutral-800"}`}
                onDragOver={(event) => {
                  if (!isBoxDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setOverBox({ id: box.id, place: event.clientY < bounds.top + bounds.height / 2 ? "before" : "after" });
                }}
                onDrop={(event) => {
                  if (!isBoxDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  const bounds = event.currentTarget.getBoundingClientRect();
                  dropBox(
                    event.dataTransfer.getData(boxType),
                    box.id,
                    event.clientY < bounds.top + bounds.height / 2 ? "before" : "after",
                  );
                }}
              >
                <div className="mb-2 flex items-center gap-1">
                  <button
                    type="button"
                    draggable
                    aria-label="Move"
                    className="cursor-grab px-1 text-neutral-400 active:cursor-grabbing"
                    onDragStart={(event) => {
                      event.dataTransfer.setData(boxType, box.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragId(box.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverBox(null);
                      setOverTab(null);
                    }}
                  >
                    ::
                  </button>
                  <div className="ml-auto flex gap-1">
                    {box.kind === "note" ? (
                      <WButton size="sm" variant="ghost" color="neutral" disabled={!box.text.trim()} onClick={() => setClockNote(box)}>
                        Clock
                      </WButton>
                    ) : null}
                    <WButton
                      size="sm"
                      variant="ghost"
                      color="neutral"
                      icon="trash"
                      aria-label="Remove"
                      onClick={() => removeBox(box.id)}
                    />
                  </div>
                </div>
                {box.kind === "note" ? (
                  <textarea
                    id={`box-${box.id}`}
                    value={box.text}
                    rows={6}
                    placeholder="Write or paste"
                    className="w-full resize-none bg-transparent text-sm outline-none"
                    onChange={(event) => changeBox(box.id, { ...box, text: event.currentTarget.value })}
                  />
                ) : (
                  <figure className="space-y-2">
                    <button type="button" className="block w-full" aria-label="View picture" onClick={() => setPreview(box)}>
                      <img src={box.src} alt={box.caption || "Pasted picture"} className="max-h-80 w-full cursor-zoom-in rounded-lg object-contain" />
                    </button>
                    <input
                      value={box.caption}
                      placeholder="Caption"
                      aria-label="Caption"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                      onChange={(event) => changeBox(box.id, { ...box, caption: event.currentTarget.value })}
                    />
                  </figure>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {notice ? <p className="text-sm text-warning-600 dark:text-warning-400">{notice}</p> : null}
      <WModal
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        fullscreen
        title={preview?.caption || "Picture"}
        close={
          <WButton color="neutral" variant="subtle" size="sm" icon="x" aria-label="Close" onClick={() => setPreview(null)} />
        }
      >
        {preview ? (
          <img
            src={preview.src}
            alt={preview.caption || "Pasted picture"}
            className="mx-auto max-h-[calc(100dvh-7rem)] w-full object-contain"
          />
        ) : null}
      </WModal>
      <TimeDialog
        open={clockNote !== null}
        title="On the clock"
        description="The note stays on the desk."
        initialTitle={noteTitle(clockNote?.text ?? "")}
        timeRequired
        submitLabel="Add"
        onOpenChange={(open) => {
          if (!open) setClockNote(null);
        }}
        onSubmit={(value) => {
          const saved = schedule({ title: value.title, start: value.start, end: value.end, kind: value.kind });
          if (saved) setClockNote(null);
        }}
      />
    </div>
  );
}

function isBoxDrag(data: DataTransfer) {
  return [...data.types].includes(boxType);
}

function noteTitle(text: string) {
  const line = text
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);
  return (line ?? "").slice(0, 80);
}

function place(desk: DayDesk, box: DeskBox): DayDesk {
  return {
    ...desk,
    tabs: desk.tabs.map((tab) => (tab.id === desk.active ? { ...tab, boxes: [box, ...tab.boxes] } : tab)),
  };
}

function TabChip({
  tab,
  selected,
  closable,
  armed,
  onSelect,
  onRename,
  onClose,
  onDragOver,
  onDrop,
}: {
  tab: DeskTab;
  selected: boolean;
  closable: boolean;
  armed: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onClose: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1 rounded-md py-1 pr-1 pl-2 ${armed ? "ring-2 ring-primary-500/50" : ""} ${selected ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {selected ? (
        <input
          aria-label="Tab name"
          value={tab.name}
          size={Math.max(tab.name.length, 4)}
          className="bg-transparent text-sm font-medium outline-none"
          onChange={(event) => onRename(event.currentTarget.value)}
        />
      ) : (
        <button type="button" className="text-sm text-neutral-500 dark:text-neutral-400" onClick={onSelect}>
          {tab.name || "Untitled"}
        </button>
      )}
      {closable ? (
        <button
          type="button"
          className="px-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          aria-label={`Close ${tab.name || "tab"}`}
          onClick={onClose}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
