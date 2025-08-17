"use client";

import { useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateStat } from "./arkham-actions";

export default function HealthTracker({
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
    const cur = current ?? max; // default to full health if unset
    return Math.max(0, Math.min(max, cur));
  }, [current, max]);

  const bump = (delta: number) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("investigatorId", investigatorId);
    fd.set("field", "currentHealth");
    fd.set("delta", String(delta));
    startTransition(async () => {
      await updateStat(fd);
    });
  };

  const setToMax = () => bump(max - display);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">Health</span>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => bump(-1)}>
          -1
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums">
          {display} / {max}
        </span>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => bump(1)}>
          +1
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={setToMax}>
          Heal
        </Button>
      </div>
    </div>
  );
}
