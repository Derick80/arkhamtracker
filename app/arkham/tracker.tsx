"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleInvestigator } from "../actions/arkham-actions";
import InvestigatorCard from "./arkham-inv-card";

// ----------------- Types -----------------
export type InvestigatorOption = { code: string; name: string };
type InvestigatorCode = string;

type PhaseChecklistItem = { id: string; label: string; checked: boolean };
type InvestigatorTurn = {
  startOfTurn: boolean;
  actions: { id: string; label: string; checked: boolean }[];
  endOfTurn: boolean;
};
type InvestigationPhase = {
  startOfPhase: boolean;
  turns: Record<InvestigatorCode, InvestigatorTurn>;
  endOfPhase: boolean;
};
type RoundTrackerState = {
  mythos: PhaseChecklistItem[];
  investigation: InvestigationPhase;
  enemy: PhaseChecklistItem[];
  upkeep: PhaseChecklistItem[];
  meta: { scenario?: string; date?: string; notes?: string };
};
type Game = {
  id: string;
  name: string;
  createdAt: number;
  investigator1: SimpleInvestigator;
  investigator2?: SimpleInvestigator | null;
  tracker: RoundTrackerState;
};

// ----------------- Shared UI helpers -----------------
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function SectionHeading({ roman, title, className }: { roman: string; title: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="font-semibold">{roman}.</div>
      <div className="font-semibold">{title}</div>
    </div>
  );
}

function Checklist({
  items,
  onToggle,
  dense = false,
  columns = 2,
}: {
  items: PhaseChecklistItem[];
  onToggle: (id: string, next: boolean) => void;
  dense?: boolean;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4",
        dense ? "gap-1" : "gap-2"
      )}
    >
      {items.map((it) => (
        <label
          key={it.id}
          className={cn(
            "flex items-center gap-2 rounded-lg border",
            dense ? "p-2" : "p-3",
            it.checked && "bg-muted"
          )}
        >
          <Checkbox
            className={dense ? "h-4 w-4" : "h-5 w-5"}
            checked={it.checked}
            onCheckedChange={(v) => onToggle(it.id, Boolean(v))}
          />
          <span className={dense ? "text-xs" : "text-sm"}>{it.label}</span>
        </label>
      ))}
    </div>
  );
}

function InvestigatorTurnBlock({
  name,
  state,
  onToggle,
  dense = false,
}: {
  name: string;
  state: InvestigatorTurn;
  onToggle: (key: "startOfTurn" | "endOfTurn" | `action:${string}`, next: boolean) => void;
  dense?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border", dense ? "p-2 space-y-1" : "p-3 space-y-2")}>
      <div className="flex items-center justify-between">
        <span className={dense ? "text-sm font-medium truncate" : "text-base font-medium truncate"}>
          {name}
        </span>
      </div>
      <div className={dense ? "space-y-1" : "space-y-2"}>
        <span className={dense ? "text-[10px] text-muted-foreground" : "text-xs text-muted-foreground"}>
          Actions
        </span>
        <div className={cn("flex items-center", dense ? "gap-2" : "gap-3")}>
          {state.actions.map((a, idx) => (
            <Checkbox
              key={a.id}
              className={dense ? "h-5 w-5" : "h-6 w-6"}
              checked={a.checked}
              onCheckedChange={(v) => onToggle(`action:${a.id}`, Boolean(v))}
              aria-label={`Action ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------- Phase templates -----------------
function baseMythos(): PhaseChecklistItem[] {
  return [
    { id: "doom", label: "Place 1 doom (check threshold)", checked: false },
    { id: "enc1", label: "Inv 1 encounter", checked: false },
    { id: "enc2", label: "Inv 2 encounter", checked: false },
  ];
}
function baseEnemy(): PhaseChecklistItem[] {
  return [
    { id: "hunters", label: "Hunters move", checked: false },
    { id: "attacks", label: "Enemies attack", checked: false },
  ];
}
function baseUpkeep(): PhaseChecklistItem[] {
  return [
    { id: "reset", label: "Ready exhausted", checked: false },
    { id: "draw1", label: "Inv 1 draw", checked: false },
    { id: "draw2", label: "Inv 2 draw", checked: false },
    { id: "resources", label: "+1 resource each", checked: false },
    { id: "hand", label: "Check hand size", checked: false },
  ];
}
function makeInvestigatorTurn(labelPrefix: string): InvestigatorTurn {
  return {
    startOfTurn: false,
    actions: [
      { id: "a1", label: `${labelPrefix} Action 1`, checked: false },
      { id: "a2", label: `${labelPrefix} Action 2`, checked: false },
      { id: "a3", label: `${labelPrefix} Action 3`, checked: false },
      { id: "a4", label: `${labelPrefix} Action 4 (if any)`, checked: false },
    ],
    endOfTurn: false,
  };
}
function makeInvestigationPhase(
  inv1: SimpleInvestigator,
  inv2?: SimpleInvestigator | null
): InvestigationPhase {
  const turns: Record<string, InvestigatorTurn> = {
    [inv1.code]: makeInvestigatorTurn(inv1.name),
  };
  if (inv2) turns[inv2.code] = makeInvestigatorTurn(inv2.name);
  return { startOfPhase: false, turns, endOfPhase: false };
}
function initTracker(inv1: SimpleInvestigator, inv2?: SimpleInvestigator | null): RoundTrackerState {
  return {
    mythos: baseMythos(),
    investigation: makeInvestigationPhase(inv1, inv2 ?? undefined),
    enemy: baseEnemy(),
    upkeep: baseUpkeep(),
    meta: { scenario: "", date: new Date().toISOString().slice(0, 10), notes: "" },
  };
}

// ----------------- LocalStorage helpers -----------------
const LS_KEY = "ahlcg-games.v1";
const LS_ACTIVE_KEY = "ahlcg-active-game-id.v1";
function loadGames(): Game[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveGames(games: Game[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(games));
}
function loadActiveGameId(): string | null {
  return localStorage.getItem(LS_ACTIVE_KEY);
}
function saveActiveGameId(gameId: string) {
  localStorage.setItem(LS_ACTIVE_KEY, gameId);
}

// ----------------- GameCreator (responsive minimal) -----------------
function GameCreator({
  investigators,
  onCreate,
  existingNames,
}: {
  investigators: SimpleInvestigator[];
  onCreate: (game: Game) => void;
  existingNames: string[];
}) {
  const [name, setName] = useState("");
  const [inv1, setInv1] = useState<string>("");
  const [inv2, setInv2] = useState<string>("none");

  const chosen1 = investigators?.find((i) => i.code === inv1) || null;
  const chosen2 = inv2 === "none" ? null : investigators?.find((i) => i.code === inv2) || null;
  const nameTaken = useMemo(() => name.trim() && existingNames.includes(name.trim()), [name, existingNames]);

  function handleCreate() {
    if (!name.trim() || !chosen1) return;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const game: Game = {
      id,
      name: name.trim(),
      createdAt: Date.now(),
      investigator1: chosen1,
      investigator2: chosen2,
      tracker: initTracker(chosen1, chosen2),
    };
    onCreate(game);
  }

  return (
    <Card className="mx-auto w-full max-w-[420px] md:max-w-3xl">
      <CardHeader className="py-2 px-3 md:px-4 md:py-3">
        <CardTitle className="text-sm md:text-base">Create a New Game</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="grid gap-2">
          <label className="text-xs md:text-sm font-medium">Game Name</label>
          <Input
            className="h-8 md:h-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., The Gathering"
          />
          {nameTaken ? <p className="text-xs text-destructive">Name already exists.</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 1</label>
            <Select value={inv1} onValueChange={setInv1}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {investigators?.map((i) => (
                  <SelectItem key={i.code} value={i.code}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 2</label>
            <Select value={inv2} onValueChange={setInv2}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {investigators
                  ?.filter((i) => i.code !== inv1)
                  .map((i) => (
                    <SelectItem key={i.code} value={i.code}>
                      {i.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full h-8 md:h-9 text-xs md:text-sm"
          disabled={!name.trim() || !inv1 || !!nameTaken}
          onClick={handleCreate}
        >
          Create Game
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------- Shared tracker logic -----------------
function useTrackerTransforms(game: Game, onUpdate: (next: Game) => void) {
  const { tracker } = game;
  const isTwoPlayer = !!game.investigator2;

  const mythosItems = React.useMemo(
    () => (isTwoPlayer ? tracker.mythos : tracker.mythos.filter((i) => i.id !== "enc2")),
    [isTwoPlayer, tracker.mythos]
  );

  const upkeepItems = React.useMemo(
    () => (isTwoPlayer ? tracker.upkeep : tracker.upkeep.filter((i) => i.id !== "draw2")),
    [isTwoPlayer, tracker.upkeep]
  );

  function setChecklist(phase: "mythos" | "enemy" | "upkeep", id: string, next: boolean) {
    const list = tracker[phase].map((i) => (i.id === id ? { ...i, checked: next } : i));
    onUpdate({ ...game, tracker: { ...tracker, [phase]: list } });
  }

  function setTurn(
    invCode: string,
    key: "startOfTurn" | "endOfTurn" | `action:${string}`,
    next: boolean
  ) {
    const phase = tracker.investigation;
    const turn = phase.turns[invCode];
    if (!turn) return;

    let nextTurn = { ...turn };
    if (key === "startOfTurn" || key === "endOfTurn") {
      (nextTurn as InvestigatorTurn)[key] = next;
    } else if (key.startsWith("action:")) {
      const actionId = key.split(":")[1]!;
      nextTurn = {
        ...turn,
        actions: turn.actions.map((a) => (a.id === actionId ? { ...a, checked: next } : a)),
      };
    }

    onUpdate({
      ...game,
      tracker: {
        ...tracker,
        investigation: {
          ...phase,
          turns: { ...phase.turns, [invCode]: nextTurn },
        },
      },
    });
  }

  function resetAllPhases() {
    const fresh = initTracker(game.investigator1, game.investigator2 ?? null);
    onUpdate({ ...game, tracker: fresh });
  }

  return { mythosItems, upkeepItems, setChecklist, setTurn, resetAllPhases };
}

// ----------------- Mobile View -----------------
function GameTrackerViewMobile({
  game,
  onUpdate,
}: {
  game: Game;
  onUpdate: (next: Game) => void;
}) {
  const { mythosItems, upkeepItems, setChecklist, setTurn, resetAllPhases } = useTrackerTransforms(
    game,
    onUpdate
  );
  const t = game.tracker;

  return (
    <div className="space-y-3 max-w-[420px] mx-auto">
      <h3 className="text-sm font-semibold text-muted-foreground">I. MYTHOS PHASE</h3>
      <Checklist items={mythosItems} onToggle={(id, n) => setChecklist("mythos", id, n)} dense columns={2} />

      <SectionHeading roman="II" title="INVESTIGATION PHASE" className="text-sm" />
      <div className="grid gap-2">
        <InvestigatorTurnBlock
          name={game.investigator1.name}
          state={t.investigation.turns[game.investigator1.code]}
          onToggle={(k, n) => setTurn(game.investigator1.code, k, n)}
          dense
        />
        {game.investigator2 && (
          <InvestigatorTurnBlock
            name={game.investigator2.name}
            state={t.investigation.turns[game.investigator2.code]}
            onToggle={(k, n) => setTurn(game.investigator2!.code, k, n)}
          />
        )}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground">III. ENEMY PHASE</h3>
      <Checklist items={t.enemy} onToggle={(id, n) => setChecklist("enemy", id, n)} dense columns={2} />

      <h3 className="text-sm font-semibold text-muted-foreground">IV. UPKEEP PHASE</h3>
      <Checklist items={upkeepItems} onToggle={(id, n) => setChecklist("upkeep", id, n)} dense columns={2} />

      <div className="flex justify-center pt-1">
        <Button variant="destructive" size="sm" className="h-8" onClick={resetAllPhases}>
          Reset All
        </Button>
      </div>
    </div>
  );
}

// ----------------- Desktop View -----------------
function GameTrackerViewDesktop({
  game,
  onUpdate,
}: {
  game: Game;
  onUpdate: (next: Game) => void;
}) {
  const { mythosItems, upkeepItems, setChecklist, setTurn, resetAllPhases } = useTrackerTransforms(
    game,
    onUpdate
  );
  const t = game.tracker;

  return (
    <div className="space-y-4">
<div className="grid grid-cols-1 gap-4 mt-4">
        {/* Mythos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">I. Mythos</CardTitle>
          </CardHeader>
          <CardContent>
            <Checklist items={mythosItems} onToggle={(id, n) => setChecklist("mythos", id, n)} columns={2} />
          </CardContent>
        </Card>

        {/* Investigation */}
        <Card >
          <CardHeader >
            <CardTitle className="text-base">II. Investigation</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <InvestigatorTurnBlock
              name={game.investigator1.name}
              state={t.investigation.turns[game.investigator1.code]}
              onToggle={(k, n) => setTurn(game.investigator1.code, k, n)}
            />
            {game.investigator2 && (
              <InvestigatorTurnBlock
                name={game.investigator2.name}
                state={t.investigation.turns[game.investigator2.code]}
                onToggle={(k, n) => setTurn(game.investigator2!.code, k, n)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Enemy */}
        <Card className="col-span-6">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">III. Enemy</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Checklist items={t.enemy} onToggle={(id, n) => setChecklist("enemy", id, n)} columns={2} />
          </CardContent>
        </Card>

        {/* Upkeep */}
        <Card className="col-span-6">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">IV. Upkeep</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Checklist items={upkeepItems} onToggle={(id, n) => setChecklist("upkeep", id, n)} columns={2} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button variant="destructive" size="default" onClick={resetAllPhases}>
          Reset All Phases
        </Button>
      </div>
    </div>
  );
}

// ----------------- Shell -----------------
export default function Tracker({
  initialInvestigators,
}: {
  initialInvestigators: SimpleInvestigator[];
}) {
  const [investigators] = useState<SimpleInvestigator[]>(initialInvestigators);
  const [games, setGames] = useState<Game[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from storage
  useEffect(() => {
    const g = loadGames();
    const a = loadActiveGameId();
    setGames(g);
    setActiveId(a && g.some((x) => x.id === a) ? a : g[0]?.id ?? null);
  }, []);

  // Persist
  useEffect(() => {
    saveGames(games);
  }, [games]);
  useEffect(() => {
    if (activeId) saveActiveGameId(activeId);
  }, [activeId]);

  const activeGame = useMemo(() => games.find((g) => g.id === activeId) || null, [games, activeId]);

  function createGame(game: Game) {
    setGames((prev) => [game, ...prev]);
    setActiveId(game.id);
  }
  function updateActive(next: Game) {
    setGames((prev) => prev.map((g) => (g.id === next.id ? next : g)));
  }
  function deleteGame(id: string) {
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function resetPhase(phase: "mythos" | "investigation" | "enemy" | "upkeep") {
    if (!activeGame) return;
    let tracker = activeGame.tracker;
    if (phase === "mythos") tracker = { ...tracker, mythos: baseMythos() };
    if (phase === "enemy") tracker = { ...tracker, enemy: baseEnemy() };
    if (phase === "upkeep") tracker = { ...tracker, upkeep: baseUpkeep() };
    if (phase === "investigation") {
      tracker = {
        ...tracker,
        investigation: makeInvestigationPhase(
          activeGame.investigator1,
          activeGame.investigator2 ?? undefined
        ),
      };
    }
    updateActive({ ...activeGame, tracker });
  }

  return (
    <div className="container mx-auto px-2 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
      {!activeGame ? (
        <GameCreator
          investigators={investigators}
          onCreate={createGame}
          existingNames={games.map((g) => g.name)}
        />
      ) : (
        <>
          {/* Mobile view */}
          <div className="md:hidden">
            <GameTrackerViewMobile game={activeGame} onUpdate={updateActive} />
            <Card className="mt-3 max-w-[420px] mx-auto">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate">{activeGame.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(activeGame.createdAt).toLocaleString()}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 grid gap-1">
                <div className="text-xs">
                  <span className="font-medium">Inv 1:</span> {activeGame.investigator1.name}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Inv 2:</span> {activeGame.investigator2?.name ?? "—"}
                </div>
              </CardContent>
            </Card>

<div className="max-w-[420px] mx-auto mt-3 grid grid-cols-1 gap-3">
              <InvestigatorCard
                game={{
                  ...activeGame,
                  investigator1: { id: activeGame.investigator1.code, ...activeGame.investigator1 },
                  investigator2: activeGame.investigator2
                    ? { id: activeGame.investigator2.code, ...activeGame.investigator2 }
                    : undefined,
                }}
              />
            </div>

            <div className="max-w-[420px] mx-auto flex items-center gap-2 mt-3">
              <Button variant="destructive" size="sm" className="h-8" onClick={() => deleteGame(activeGame.id)}>
                Reset Game
              </Button>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <GameTrackerViewDesktop game={activeGame} onUpdate={updateActive} />

<div className="grid grid-cols-1 gap-4 mt-4">
              <Card className="col-span-6">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{activeGame.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(activeGame.createdAt).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Investigator 1:</span> {activeGame.investigator1.name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Investigator 2:</span> {activeGame.investigator2?.name ?? "—"}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-6">
                <InvestigatorCard
                  game={{
                    ...activeGame,
                    investigator1: { id: activeGame.investigator1.code, ...activeGame.investigator1 },
                    investigator2: activeGame.investigator2
                      ? { id: activeGame.investigator2.code, ...activeGame.investigator2 }
                      : undefined,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteGame(activeGame.id)}>
                Reset Game
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
