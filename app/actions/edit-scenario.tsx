"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateScenario } from "./arkham-actions";
import { EditIcon } from "lucide-react";

type Props = {
  gameId: string;
  initialValue: string | null | undefined;
};

/**
 * Inline editable scenario field:
 * - View mode: shows text (or placeholder) + "Edit"
 * - Edit mode: Input + Save / Clear / Cancel
 * - Persists via server action; optimistic local update
 */
export default function EditableScenario({ gameId, initialValue }: Props) {
  const [editing, setEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>(initialValue ?? "");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("intent", "save");
    formData.set("scenario", value);
    startTransition(async () => {
      await updateScenario(null,formData);
      setEditing(false);
    });
  };

  const clearScenario = () => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("intent", "clear");
    startTransition(async () => {
      await updateScenario(null,fd);
      setValue("");
      setEditing(false);
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Revert to server value (best-effort) by canceling edits
      setValue(initialValue ?? "");
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <span className="block text-xs text-muted-foreground">Scenario</span>
          <span className="block truncate">
            {value ? value : <span className="italic text-muted-foreground">No scenario</span>}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          className="shrink-0"
        >
        <EditIcon />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md items-end gap-2">
      <div className="flex-1">
        <span className="block text-xs text-muted-foreground mb-1">Scenario</span>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g., The Gathering"
          maxLength={120}
          disabled={pending}
        />
      </div>

      <Button
        type="button"
        size="sm"
        onClick={save}
        disabled={pending}
        className="shrink-0"
      >
        {pending ? "Saving…" : "Save"}
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={clearScenario}
        disabled={pending}
        className="shrink-0"
        title="Clear the scenario"
      >
        Clear
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          setValue(initialValue ?? "");
          setEditing(false);
        }}
        disabled={pending}
        className="shrink-0"
      >
        Cancel
      </Button>
    </div>
  );
}
