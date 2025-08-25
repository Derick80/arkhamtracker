"use client";

import { useMemo, useTransition } from "react";
import Image from "next/image";
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
  const canIncrease = display < max;

  const bump = (delta: number) => {
    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("investigatorId", investigatorId);
    formData.set("field", "currentHealth");
    formData.set("delta", String(delta));
    startTransition(async () => {
      await updateStat(formData);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
        <Image
          src="/assets/images/Health.webp"
          alt="Health"
          width={16}
          height={16}
        />
        Health
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" disabled={pending} onClick={() => bump(-1)}>
          -
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums">
          {display} / {max}
        </span>

        <Button
          variant="outline"
          disabled={!canIncrease}
          onClick={() => bump(1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}
