import { useEffect, useState, type FormEvent } from "react";
import { WButton, WFormField, WInput, WModal, WSelect } from "wispui";
import { blockKinds, type BlockKind } from "./sample";

export function TimeDialog({
  open,
  title,
  description,
  initialTitle = "",
  initialStart = "",
  initialEnd = "",
  initialKind = "Focus",
  initialDate,
  titleEditable = true,
  timeRequired = false,
  submitLabel,
  submitIcon = "plus",
  onOpenChange,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  title: string;
  description: string;
  initialTitle?: string;
  initialStart?: string;
  initialEnd?: string;
  initialKind?: BlockKind;
  initialDate?: string;
  titleEditable?: boolean;
  timeRequired?: boolean;
  submitLabel: string;
  submitIcon?: "plus" | "check";
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { title: string; start: string; end: string; kind: BlockKind; date?: string }) => void;
  onDelete?: () => void;
}) {
  const [itemTitle, setItemTitle] = useState(initialTitle);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [kind, setKind] = useState<BlockKind>(initialKind);
  const [day, setDay] = useState(initialDate ?? "");

  useEffect(() => {
    if (!open) return;
    setItemTitle(initialTitle);
    setStart(initialStart);
    setEnd(initialEnd);
    setKind(initialKind);
    setDay(initialDate ?? "");
  }, [open, initialTitle, initialStart, initialEnd, initialKind, initialDate]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ title: itemTitle, start, end, kind, ...(initialDate !== undefined ? { date: day } : {}) });
  }

  return (
    <WModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={title}
      description={description}
      close={
        <WButton color="neutral" variant="subtle" size="sm" icon="x" aria-label="Close" onClick={() => onOpenChange(false)} />
      }
      footer={({ close }) => (
        <>
          {onDelete ? (
            <WButton
              color="error"
              variant="subtle"
              icon="trash"
              onClick={() => {
                onDelete();
                close();
              }}
            >
              Delete
            </WButton>
          ) : null}
          <div className={onDelete ? "ml-auto flex gap-2" : "contents"}>
            <WButton color="neutral" variant="subtle" onClick={close}>
              Cancel
            </WButton>
            <WButton type="submit" form="time-form" icon={submitIcon}>
              {submitLabel}
            </WButton>
          </div>
        </>
      )}
    >
      <form id="time-form" className="space-y-4" onSubmit={submit}>
        {initialDate !== undefined ? (
          <WFormField label="Day">
            <WInput type="date" required aria-label="Day" value={day} onChange={(event) => setDay(event.currentTarget.value)} />
          </WFormField>
        ) : null}
        {titleEditable ? (
          <WFormField label="Title">
            <WInput
              required
              autoFocus
              aria-label="Title"
              placeholder="What needs doing"
              value={itemTitle}
              onChange={(event) => setItemTitle(event.currentTarget.value)}
            />
          </WFormField>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <WFormField label="Starts" hint={timeRequired ? undefined : "Optional"}>
            <WInput
              type="time"
              required={timeRequired}
              autoFocus={!titleEditable}
              aria-label="Starts"
              value={start}
              onChange={(event) => setStart(event.currentTarget.value)}
            />
          </WFormField>
          <WFormField label="Ends" hint="Optional">
            <WInput type="time" aria-label="Ends" value={end} onChange={(event) => setEnd(event.currentTarget.value)} />
          </WFormField>
        </div>
        <WFormField label="Tag">
          <WSelect
            aria-label="Tag"
            items={blockKinds}
            value={kind}
            onChange={(event) => setKind(event.currentTarget.value as BlockKind)}
          />
        </WFormField>
      </form>
    </WModal>
  );
}

export function MoveDialog({
  open,
  initialDate,
  description,
  onOpenChange,
  onMove,
}: {
  open: boolean;
  initialDate: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onMove: (date: string) => void;
}) {
  const [day, setDay] = useState(initialDate);

  useEffect(() => {
    if (!open) return;
    setDay(initialDate);
  }, [open, initialDate]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onMove(day);
  }

  return (
    <WModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Move"
      description={description}
      close={
        <WButton color="neutral" variant="subtle" size="sm" icon="x" aria-label="Close" onClick={() => onOpenChange(false)} />
      }
      footer={({ close }) => (
        <>
          <WButton color="neutral" variant="subtle" onClick={close}>
            Cancel
          </WButton>
          <WButton type="submit" form="move-form">
            Move
          </WButton>
        </>
      )}
    >
      <form id="move-form" onSubmit={submit}>
        <WFormField label="Day">
          <WInput type="date" required autoFocus aria-label="Day" value={day} onChange={(event) => setDay(event.currentTarget.value)} />
        </WFormField>
      </form>
    </WModal>
  );
}
