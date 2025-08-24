'use client'

import { Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
 } from "@/components/ui/select"
import { addInvestigator, SimpleInvestigator } from "./arkham-actions"
import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"

type InvestigatorSelectProps ={
  gameId: string;
  investigators: SimpleInvestigator[]; // full list
  currentSelected?: { code: string }[]; // currently in game
}

const InvestigatorSelect = ({ investigators, gameId, currentSelected = [] }: InvestigatorSelectProps) => {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(addInvestigator, null);

  const selectedCodes = new Set(currentSelected.map(c => c.code));
  const available = investigators.filter(inv => !selectedCodes.has(inv.code));
  const maxReached = currentSelected.length >= 2;

  if (maxReached) {
    return (
      <div className="rounded-xl border p-4 text-sm">
        Maximum of 2 investigators already selected.
      </div>
    );
  }

  if (!available.length) {
    return (
      <div className="rounded-xl border p-4 text-sm">
        No more investigators available to add.
      </div>
    );
  }

  // Define a narrow state type for error/success returned by action
  type ActionState = { error?: unknown; success?: boolean } | null;
  const typedState = state as ActionState;

  return (
    <div className="rounded-2xl border p-2">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="text-sm"
          disabled={isPending}
        >
          {open ? "Cancel" : "Add Investigator"}
        </Button>
      </div>
      {open && (
        <form
          action={action}
          className="mt-3 flex flex-col gap-3 sm:flex-row"
        >
          <input type="hidden" name="gameId" value={gameId} />
          <Select name="investigatorCode">
            <SelectTrigger>
              <SelectValue placeholder="Select an investigator" />
            </SelectTrigger>
            <SelectContent>
              {available.map(inv => (
                <SelectItem key={inv.code} value={inv.code}>
                  {inv.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      )}
      {typedState?.error ? (
        <p className="mt-2 text-xs text-red-500">{String(typedState.error)}</p>
      ) : null}
    </div>
  );
};

export default InvestigatorSelect