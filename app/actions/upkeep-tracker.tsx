"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getUpkeepState, toggleUpkeep, resetUpkeep } from "./arkham-actions";

type UpkeepState = {
  upkeepUnexhaust: boolean;
  upkeepDrawP1: boolean;
  upkeepDrawP2: boolean;
  upkeepGainRes: boolean;
  upkeepCheckHand: boolean;
};

export default function UpkeepTracker({ gameId }: { gameId: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<UpkeepState>({
    upkeepUnexhaust: false,
    upkeepDrawP1: false,
    upkeepDrawP2: false,
    upkeepGainRes: false,
    upkeepCheckHand: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getUpkeepState(gameId);
      if (mounted && s) setState(s);
    })();
    const handler = () =>
      setState({
        upkeepUnexhaust: false,
        upkeepDrawP1: false,
        upkeepDrawP2: false,
        upkeepGainRes: false,
        upkeepCheckHand: false,
      });
    window.addEventListener("arkham:reset-all", handler);
    return () => {
      mounted = false;
      window.removeEventListener("arkham:reset-all", handler);
    };
  }, [gameId]);

  const toggle = (step: keyof UpkeepState) => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    fd.set("step", step);
    startTransition(async () => {
      await toggleUpkeep(fd);
      setState((prev) => ({ ...prev, [step]: !prev[step] }));
    });
  };

  const onReset = () => {
    const fd = new FormData();
    fd.set("gameId", gameId);
    startTransition(async () => {
      await resetUpkeep(fd);
      setState({
        upkeepUnexhaust: false,
        upkeepDrawP1: false,
        upkeepDrawP2: false,
        upkeepGainRes: false,
        upkeepCheckHand: false,
      });
    });
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium">Upkeep Phase</h4>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={pending}>
          Reset
        </Button>
      </div>
      <ul className="space-y-2">
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.upkeepUnexhaust}
            onChange={() => toggle("upkeepUnexhaust")}
            disabled={pending}
          />
          <span>1) Unexhaust cards</span>
        </li>
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.upkeepDrawP1}
            onChange={() => toggle("upkeepDrawP1")}
            disabled={pending}
          />
          <span>2) Player 1 draws a card</span>
        </li>
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.upkeepDrawP2}
            onChange={() => toggle("upkeepDrawP2")}
            disabled={pending}
          />
          <span>3) Player 2 draws a card</span>
        </li>
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.upkeepGainRes}
            onChange={() => toggle("upkeepGainRes")}
            disabled={pending}
          />
          <span>4) Each investigator gains 1 resource</span>
        </li>
        <li className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.upkeepCheckHand}
            onChange={() => toggle("upkeepCheckHand")}
            disabled={pending}
          />
          <span>5) Check hand size (8)</span>
        </li>
      </ul>
    </div>
  );
}
