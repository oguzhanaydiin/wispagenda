import { useEffect, useState, type FormEvent } from "react";
import { WButton, WFormField, WInput, WModal, WSelect } from "wispui";
import { blockKinds, type BlockKind } from "./sample";

export function TimeDialog({
  open,
  title,
  description,
  initialTitle = "",
  titleEditable = true,
  timeRequired = false,
  submitLabel,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  initialTitle?: string;
  titleEditable?: boolean;
  timeRequired?: boolean;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { title: string; start: string; end: string; kind: BlockKind }) => void;
}) {
  const [itemTitle, setItemTitle] = useState(initialTitle);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [kind, setKind] = useState<BlockKind>("Focus");

  useEffect(() => {
    if (!open) return;
    setItemTitle(initialTitle);
    setStart("");
    setEnd("");
    setKind("Focus");
  }, [open, initialTitle]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ title: itemTitle, start, end, kind });
  }

  return (
    <WModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={title}
      description={description}
      footer={({ close }) => (
        <>
          <WButton color="neutral" variant="ghost" onClick={close}>
            Cancel
          </WButton>
          <WButton type="submit" form="time-form" icon="plus">
            {submitLabel}
          </WButton>
        </>
      )}
    >
      <form id="time-form" className="space-y-4" onSubmit={submit}>
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
