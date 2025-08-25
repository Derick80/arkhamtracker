"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateNotes } from "@/app/actions/arkham-actions";
// Placeholder server action - implement in arkham-actions.ts
// import { updateNotes } from "../../app/actions/arkham-actions";

type NotesProps = {
  gameId: string;
  initialValue?: string | null;
};

/**
 * Editable multiline Notes section.
 * Click (or press Enter while focused) to enter edit mode.
 * Supports multiple lines; saves via server action (to be added).
 */
export default function EditableNotes({ gameId      , initialValue }: NotesProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(initialValue ?? "");
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  console.log("EditableNotes render", { gameId, initialValue, value });
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const save = () => {
    const formData = new FormData();
    formData.set("gameId", gameId); // using game id when persisting notes
    formData.set("notes", value);
    startTransition(async () => {
      await updateNotes(formData, null);
      setEditing(false);
    });
  };

  const cancel = () => {
    setValue(initialValue ?? "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setEditing(true);
          }
        }}
        className="group rounded-md border border-dashed p-3 text-sm cursor-text hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Edit notes"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Notes</span>
          <span className="text-[10px] text-muted-foreground group-hover:opacity-100 opacity-0 transition">Click to edit</span>
        </div>
        {value ? (
          <pre className="whitespace-pre-wrap font-sans text-sm">{value}</pre>
        ) : (
          <span className="italic text-muted-foreground">Add notes…</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Notes</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" type="button" onClick={cancel} disabled={pending}>Cancel</Button>
          <Button size="sm" type="button" onClick={save} disabled={pending || value === (initialValue ?? "")}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        placeholder="Type your campaign notes here..."
        className="resize-y"
        disabled={pending}
      />
    </div>
  );
}