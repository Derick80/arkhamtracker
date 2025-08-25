"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getEnemiesState, toggleEnemies, resetEnemies } from "../../app/actions/arkham-actions";

type EnemiesState = {
  enemiesHunterMove: boolean;
  enemiesAttack: boolean;
};

export default function EnemiesTracker({ gameId }: { gameId: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<EnemiesState>({
    enemiesHunterMove: false,
    enemiesAttack: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getEnemiesState(gameId);
      if (mounted && s) setState(s);
    })();
    const handler = () =>
      setState({ enemiesHunterMove: false, enemiesAttack: false });
    window.addEventListener("arkham:reset-all", handler);
    return () => {
      mounted = false;
      window.removeEventListener("arkham:reset-all", handler);
    };
  }, [gameId]);

  const toggle = (step: keyof EnemiesState) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("step", step);
    startTransition(async () => {
      await toggleEnemies(fd);
      setState((prev) => ({ ...prev, [step]: !prev[step] }));
    });
  };

  const onReset = () => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    startTransition(async () => {
      await resetEnemies(fd);
      setState({ enemiesHunterMove: false, enemiesAttack: false });
    });
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium">Enemies Phase</h4>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={pending}>
          Reset
        </Button>
      </div>
      <ul className="space-y-2">
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.enemiesHunterMove}
            onChange={() => toggle("enemiesHunterMove")}
            disabled={pending}
          />
          <span>1) Enemies with Hunter move</span>
        </li>
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.enemiesAttack}
            onChange={() => toggle("enemiesAttack")}
            disabled={pending}
          />
          <span>2) Enemies attack</span>
        </li>
      </ul>
    </div>
  );
}
