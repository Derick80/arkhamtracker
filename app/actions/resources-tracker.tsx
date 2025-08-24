"use client";

import { useMemo, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { updateStat } from "./arkham-actions";

export default function ResourcesTracker({
  gameId,
  investigatorId,
  current,
}: {
  gameId: string;
  investigatorId: string;
  current: number | null | undefined;
}) {
  const [pending, startTransition] = useTransition();
  const display = useMemo(() => {
    const cur = current ?? 5; // default starting resources
    return Math.max(0, cur);
  }, [current]);

  const bump = (delta: number) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("investigatorId", investigatorId);
    fd.set("field", "resources");
    fd.set("delta", String(delta));
    startTransition(async () => {
      await updateStat(fd);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
        <Image src="/assets/images/Resource.webp" alt="Resources" width={16} height={16} />
        Resources
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" disabled={pending} onClick={() => bump(-1)}>
          -
        </Button>
        <span className="min-w-[2.5rem] text-center tabular-nums">{display}</span>
        <Button variant="outline" disabled={pending} onClick={() => bump(1)}>
          +
        </Button>
      </div>
    </div>
  );
}
