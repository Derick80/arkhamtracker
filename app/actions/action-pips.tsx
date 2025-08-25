// app/games/[gameId]/pips-client.tsx
"use client";

import React, { useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleAction, resetInvestigatorActions } from "./arkham-actions";
import { Checkbox } from "@/components/ui/checkbox";

export default function ActionPips({
  gameId,
  investigatorId,
  spent,
}: {
  gameId: string;
  investigatorId: string;
  spent: number; // 0..4
}) {
  const [pending, startTransition] = useTransition();
  // Note: since spent is server-provided, we only affect UI affordance on reset
  // The actual data is reset server-side and reflected on next navigation/revalidate
  // This keeps the checkboxes visually cleared immediately
  useEffect(() => {
    const handler = () => {
      // No local state to update here since 'spent' is a prop; left for consistency.
    };
    window.addEventListener("arkham:reset-all", handler);
    return () => window.removeEventListener("arkham:reset-all", handler);
  }, []);

  const onClickIndex = (index: number) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("investigatorId", investigatorId);
    fd.set("index", String(index));
    startTransition(async () => {
      await toggleAction(fd);
    });
  };

  const onReset = () => {
    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("investigatorId", investigatorId);
    startTransition(async () => {
      await resetInvestigatorActions(formData);
    });
  };
  return (
    <div className="flex items-center justify-between p-1 pt-0">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => {
          const checked = i < spent;
          return (
            <form key={i} action={toggleAction}>
              <input type="hidden" name="gameId" value={gameId} />
              <input
                type="hidden"
                name="investigatorId"
                value={investigatorId}
              />
              <input type="hidden" name="index" value={i} />
              <Checkbox
                key={i}
                checked={checked}
                name="actions"
                onCheckedChange={() => onClickIndex(i)}
                aria-label={`Action ${i + 1} ${checked ? "used" : "available"}`}
                disabled={pending}
                className="h-5 w-5"
              />
            </form>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={pending}
          className="h-7 px-2 text-xs"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
