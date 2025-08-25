"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleMythos, resetMythos, getMythosState } from "../../app/actions/arkham-actions";

type MythosState = {
  mythosPlaceDoom: boolean;
  mythosDrawP1: boolean;
  mythosDrawP2: boolean;
  mythosEnd: boolean;
};

export default function MythosTracker({ gameId }: { gameId: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<MythosState>({
    mythosPlaceDoom: false,
    mythosDrawP1: false,
    mythosDrawP2: false,
    mythosEnd: false,
  });

  // Load initial state on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getMythosState(gameId);
      if (mounted && s) setState(s);
    })();
    const handler = () =>
      setState({
        mythosPlaceDoom: false,
        mythosDrawP1: false,
        mythosDrawP2: false,
        mythosEnd: false,
      });
    window.addEventListener("arkham:reset-all", handler);
    return () => {
      mounted = false;
      window.removeEventListener("arkham:reset-all", handler);
    };
  }, [gameId]);

  const toggle = (step: keyof MythosState) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("step", step);
    startTransition(async () => {
      await toggleMythos(fd);
      // optimistic update
      setState((prev) => ({ ...prev, [step]: !prev[step] }));
    });
  };

  const onReset = () => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    startTransition(async () => {
      await resetMythos(fd);
      setState({
        mythosPlaceDoom: false,
        mythosDrawP1: false,
        mythosDrawP2: false,
        mythosEnd: false,
      });
    });
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium">Mythos Phase</h4>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={pending}>
          Reset
        </Button>
      </div>
      <ul className="space-y-2">
        <li className="flex items-center justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.mythosPlaceDoom}
              onChange={() => toggle("mythosPlaceDoom")}
              disabled={pending}
            />
            <span>1) Place doom</span>
          </label>
        </li>
        <li className="flex items-center justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.mythosDrawP1}
              onChange={() => toggle("mythosDrawP1")}
              disabled={pending}
            />
            <span>2) Draw Player 1 encounter card</span>
          </label>
        </li>
        <li className="flex items-center justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.mythosDrawP2}
              onChange={() => toggle("mythosDrawP2")}
              disabled={pending}
            />
            <span>3) Draw Player 2 encounter card</span>
          </label>
        </li>
        <li className="flex items-center justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.mythosEnd}
              onChange={() => toggle("mythosEnd")}
              disabled={pending}
            />
            <span>4) End of mythos phase</span>
          </label>
        </li>
      </ul>
    </div>
  );
}
