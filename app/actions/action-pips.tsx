// app/games/[gameId]/pips-client.tsx
"use client";

import { Button } from "@/components/ui/button";
import { toggleAction, resetInvestigatorActions } from "./arkham-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransition } from "react";

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
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("investigatorId", investigatorId);
    startTransition(async () => {
      await resetInvestigatorActions(fd);
    });
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => {
          const checked = i < spent;
          return (
            <form key={i} action={toggleAction}>
              <input type="hidden" name="gameId" value={gameId} />
              <input type="hidden" name="investigatorId" value={investigatorId} />
              <input type="hidden" name="index" value={i} />
              <Checkbox
              key={i}
                checked={checked}
                name='actions'
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
