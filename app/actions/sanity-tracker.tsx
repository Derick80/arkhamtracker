"use client";

import { useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateStat } from "./arkham-actions";

export default function SanityTracker({
  gameId,
  investigatorId,
  max,
  current,
}: {
  gameId: string;
  investigatorId: string;
  max: number;
  current: number | null | undefined;
}) {
  const [pending, startTransition] = useTransition();
  const display = useMemo(() => {
    const cur = current ?? max; // default to full sanity if unset
    return Math.max(0, Math.min(max, cur));
  }, [current, max]);
  const canIncrease = display < max;

  const bump = (delta: number) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("investigatorId", investigatorId);
    fd.set("field", "currentSanity");
    fd.set("delta", String(delta));
    startTransition(async () => {
      await updateStat(fd);
    });
  };


  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">Sanity</span>
      <div className="ml-auto flex items-center gap-2">
        <Button  variant="outline" disabled={pending} onClick={() => bump(-1)}>
          -
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums">
          {display} / {max}
        </span>
        {canIncrease ? (
          <Button  variant="outline" disabled={ canIncrease} onClick={() => bump(1)}>
            +
          </Button>
        ) : null}
       
      </div>
    </div>
  );
}
