"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** ---------------------------------------------
 * Types
 * --------------------------------------------- */

type InvestigatorCode = string;

type InvestigatorOption = {
  code: InvestigatorCode;
  name: string;
};

type PhaseChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

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
  meta: {
    scenario?: string;
    date?: string;
    notes?: string;
  };
};

type Game = {
  id: string; // cuid-ish; here we’ll use Date.now concatenation
  name: string;
  createdAt: number;
  investigator1: InvestigatorOption;
  investigator2?: InvestigatorOption | null;
  tracker: RoundTrackerState;
};

/** ---------------------------------------------
 * Configuration (replace with your canonical list)
 * --------------------------------------------- */

const INVESTIGATORS: InvestigatorOption[] = [
  { code: "roland_banks", name: "Roland Banks" },
  { code: "daisy_walker", name: "Daisy Walker" },
  { code: "skids_otoole", name: "\"Skids\" O'Toole" },
  { code: "agnes_baker", name: "Agnes Baker" },
  { code: "wendy_adams", name: "Wendy Adams" },
  // …extend as desired
];

/** ---------------------------------------------
 * Local Storage Helpers
 * --------------------------------------------- */

const LS_KEY = "ahlcg-games.v1";
const LS_ACTIVE_KEY = "ahlcg-active-game-id.v1";

function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Game[]) : [];
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



/** ---------------------------------------------
 * Tracker initialization based on PDF flow
 * --------------------------------------------- */

function baseMythos(): PhaseChecklistItem[] {
  return [
    { id: "doom", label: "Place 1 doom, check threshold", checked: false },
    { id: "enc1", label: "Investigator 1 encounter card", checked: false },
    { id: "enc2", label: "Investigator 2 encounter card", checked: false },
    { id: "end", label: "End of phase", checked: false },
  ];
}

function baseEnemy(): PhaseChecklistItem[] {
  return [
    { id: "start", label: "Start of phase", checked: false },
    { id: "hunters", label: "Hunter enemies move", checked: false },
    { id: "attacks", label: "Enemies attack", checked: false },
    { id: "end", label: "End of phase", checked: false },
  ];
}

function baseUpkeep(): PhaseChecklistItem[] {
  return [
    { id: "reset", label: "Reset actions, ready exhausted cards", checked: false },
    { id: "draw1", label: "Investigator 1 draw 1 card", checked: false },
    { id: "draw2", label: "Investigator 2 draw 1 card", checked: false },
    { id: "resources", label: "Each Investigator gains 1 resource", checked: false },
    { id: "hand", label: "All Investigators check hand size", checked: false },
    { id: "end", label: "End of phase/round", checked: false },
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
  inv1: InvestigatorOption,
  inv2?: InvestigatorOption | null
): InvestigationPhase {
  const turns: Record<InvestigatorCode, InvestigatorTurn> = {
    [inv1.code]: makeInvestigatorTurn(inv1.name),
  };
  if (inv2) {
    turns[inv2.code] = makeInvestigatorTurn(inv2.name);
  }
  return { startOfPhase: false, turns, endOfPhase: false };
}

function initTracker(
  inv1: InvestigatorOption,
  inv2?: InvestigatorOption | null
): RoundTrackerState {
  return {
    mythos: baseMythos(),
    investigation: makeInvestigationPhase(inv1, inv2 ?? undefined),
    enemy: baseEnemy(),
    upkeep: baseUpkeep(),
    meta: { scenario: "", date: new Date().toISOString().slice(0, 10), notes: "" },
  };
}

// 


/** ---------------------------------------------
 * UI Primitives
 * --------------------------------------------- */

function SectionHeading({
  roman,
  title,
}: {
  roman: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xl font-semibold tracking-wide">{roman}.</div>
      <div className="text-xl font-semibold tracking-wide">{title}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-border" />;
}

/** ---------------------------------------------
 * Game Creator
 * --------------------------------------------- */

function GameCreator({
  onCreate,
  existingNames,
}: {
  onCreate: (game: Game) => void;
  existingNames: string[];
}) {
  const [name, setName] = useState("");
  const [inv1, setInv1] = useState<InvestigatorCode | "">("");
  const [inv2, setInv2] = useState<InvestigatorCode | "none">("none");

  const chosen1 = INVESTIGATORS.find((i) => i.code === inv1) || null;
  const chosen2 = INVESTIGATORS.find((i) => i.code === inv2) || null;

  const nameTaken = useMemo(
    () => name.trim().length > 0 && existingNames.includes(name.trim()),
    [name, existingNames]
  );

  function handleCreate() {
    if (!name.trim() || !chosen1) return;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const game: Game = {
      id,
      name: name.trim(),
      createdAt: Date.now(),
      investigator1: chosen1,
      investigator2: chosen2 || null,
      tracker: initTracker(chosen1, chosen2),
    };
    onCreate(game);
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Game Name</label>
            <Input
              placeholder="E.g., Night of the Zealot – Curtain Call"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameTaken && (
              <p className="text-sm text-destructive">A game with that name already exists.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Investigator 1</label>
            <Select value={inv1} onValueChange={setInv1}>
              <SelectTrigger>
                <SelectValue placeholder="Select investigator" />
              </SelectTrigger>
              <SelectContent>
                {INVESTIGATORS.map((i) => (
                  <SelectItem key={i.code} value={i.code}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Investigator 2 (optional)</label>
            <Select value={inv2} onValueChange={setInv2}>
              <SelectTrigger>
                <SelectValue placeholder="Select investigator (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {INVESTIGATORS.filter((i) => i.code !== inv1).map((i) => (
                  <SelectItem key={i.code} value={i.code}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <Button
            className="w-full"
            disabled={!name.trim() || !inv1 || nameTaken}
            onClick={handleCreate}
          >
            Create Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** ---------------------------------------------
 * Phase Blocks
 * --------------------------------------------- */

function Checklist({
  items,
  onToggle,
  titleRight,
}: {
  items: PhaseChecklistItem[];
  onToggle: (id: string, next: boolean) => void;
  titleRight?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">{titleRight}</div>
      <div className="grid gap-2">
        {items.map((it) => (
          <label
            key={it.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              it.checked && "bg-muted"
            )}
          >
            <Checkbox
              checked={it.checked}
              onCheckedChange={(v) => onToggle(it.id, Boolean(v))}
            />
            <span className="text-sm">{it.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function InvestigatorTurnBlock({
  name,
  state,
  onToggle,
}: {
  name: string;
  state: InvestigatorTurn;
  onToggle: (key: "startOfTurn" | "endOfTurn" | `action:${string}`, next: boolean) => void;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-base">{name} — Turn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center gap-3">
          <Checkbox
            checked={state.startOfTurn}
            onCheckedChange={(v) => onToggle("startOfTurn", Boolean(v))}
          />
        <span className="text-sm">Start of turn</span>
        </label>

        <div className="grid gap-2">
          {state.actions.map((a) => (
            <label key={a.id} className="flex items-center gap-3 rounded-lg border p-2">
              <Checkbox
                checked={a.checked}
                onCheckedChange={(v) => onToggle(`action:${a.id}`, Boolean(v))}
              />
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>

        <label className="flex items-center gap-3">
          <Checkbox
            checked={state.endOfTurn}
            onCheckedChange={(v) => onToggle("endOfTurn", Boolean(v))}
          />
          <span className="text-sm">End of turn</span>
        </label>
      </CardContent>
    </Card>
  );
}

/** ---------------------------------------------
 * Investigator Slots (additional panels)
 * --------------------------------------------- */

function InvestigatorSlot({
  title,
}: {
  title: string;
}) {
  // Minimal slot to jot quick notes/counters per investigator; extend as needed.
  const [notes, setNotes] = useState("");
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <label className="text-sm font-medium">Notes / Status</label>
        <Textarea
          placeholder="Resources, clues, damage/horror, assets, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}

/** ---------------------------------------------
 * Game Tracker View
 * --------------------------------------------- */

function GameTrackerView({
  game,
  onUpdate,
  onResetPhase,
  onResetAllPhases
}: {
  game: Game;
  onUpdate: (next: Game) => void;
  onResetPhase: (phase: "mythos" | "investigation" | "enemy" | "upkeep") => void;
  onResetAllPhases: () => void;
}) {
  const { tracker } = game;

  function setChecklist(phase: "mythos" | "enemy" | "upkeep", id: string, next: boolean) {
    const list = tracker[phase].map((i) => (i.id === id ? { ...i, checked: next } : i));
    onUpdate({ ...game, tracker: { ...tracker, [phase]: list } });
  }

  function setInvestigationMeta(key: "startOfPhase" | "endOfPhase", next: boolean) {
    onUpdate({
      ...game,
      tracker: { ...tracker, investigation: { ...tracker.investigation, [key]: next } },
    });
  }

  function setTurn(invCode: InvestigatorCode, key: "startOfTurn" | "endOfTurn" | `action:${string}`, next: boolean) {
    const phase = tracker.investigation;
    const turn = phase.turns[invCode];
    if (!turn) return;

    let nextTurn = { ...turn };
    if (key === "startOfTurn" || key === "endOfTurn") {
      (nextTurn as any)[key] = next;
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

  return (
    <div className="space-y-6">
      {/* Scenario & Date */}
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-3 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario</label>
            <Input
              placeholder="Scenario name"
              value={tracker.meta.scenario ?? ""}
              onChange={(e) =>
                onUpdate({ ...game, tracker: { ...tracker, meta: { ...tracker.meta, scenario: e.target.value } } })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={tracker.meta.date ?? ""}
              onChange={(e) =>
                onUpdate({ ...game, tracker: { ...tracker, meta: { ...tracker.meta, date: e.target.value } } })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">Table Notes</label>
            <Input
              placeholder="Optional notes"
              value={tracker.meta.notes ?? ""}
              onChange={(e) =>
                onUpdate({ ...game, tracker: { ...tracker, meta: { ...tracker.meta, notes: e.target.value } } })
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" onClick={onResetAllPhases}>
            Reset All Phases
          </Button>
        </CardFooter>
      </Card>

      {/* I. Mythos Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="I" title="MYTHOS PHASE" />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onResetPhase("mythos")}
            >
              Reset Mythos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Checklist
            items={tracker.mythos}
            onToggle={(id, next) => setChecklist("mythos", id, next)}
          />
        </CardContent>
      </Card>

      {/* II. Investigation Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="II" title="INVESTIGATION PHASE" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3">
              <Checkbox
                checked={tracker.investigation.startOfPhase}
                onCheckedChange={(v) => setInvestigationMeta("startOfPhase", Boolean(v))}
              />
              <span className="text-sm">Start of phase</span>
            </label>
            <Button variant="secondary" size="sm" onClick={() => onResetPhase("investigation")}>
              Reset Investigation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InvestigatorTurnBlock
              name={game.investigator1.name}
              state={tracker.investigation.turns[game.investigator1.code]}
              onToggle={(k, n) => setTurn(game.investigator1.code, k, n)}
            />
            {game.investigator2 && (
              <InvestigatorTurnBlock
                name={game.investigator2.name}
                state={tracker.investigation.turns[game.investigator2.code]}
                onToggle={(k, n) => setTurn(game.investigator2!.code, k, n)}
              />
            )}
          </div>

          <Divider />

          <label className="flex items-center gap-3">
            <Checkbox
              checked={tracker.investigation.endOfPhase}
              onCheckedChange={(v) => setInvestigationMeta("endOfPhase", Boolean(v))}
            />
            <span className="text-sm">End of phase</span>
          </label>
        </CardContent>
      </Card>

      {/* III. Enemy Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="III" title="ENEMY PHASE" />
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => onResetPhase("enemy")}>
              Reset Enemy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Checklist
            items={tracker.enemy}
            onToggle={(id, next) => setChecklist("enemy", id, next)}
          />
        </CardContent>
      </Card>

      {/* IV. Upkeep Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="IV" title="UPKEEP PHASE" />
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => onResetPhase("upkeep")}>
              Reset Upkeep
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Checklist
            items={tracker.upkeep}
            onToggle={(id, next) => setChecklist("upkeep", id, next)}
          />
        </CardContent>
      </Card>

      {/* Additional Investigator Slots */}
      <div className="grid gap-4 md:grid-cols-2">
        <InvestigatorSlot title={`Investigator Slot: ${game.investigator1.name}`} />
        {game.investigator2 && (
          <InvestigatorSlot title={`Investigator Slot: ${game.investigator2.name}`} />
        )}
      </div>
    </div>
  );
}

/** ---------------------------------------------
 * Game List / Shell
 * --------------------------------------------- */

function AHLCGTrackerPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load once
  useEffect(() => {
    const g = loadGames();
    const a = loadActiveGameId();
    setGames(g);
    setActiveId(a && g.some((x) => x.id === a) ? a : g[0]?.id ?? null);
  }, []);

  // Persist games
  useEffect(() => {
    saveGames(games);
  }, [games]);

  // Persist active id
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

  function resetAllPhases() {
  if (!activeGame) return;
  const tracker = initTracker(
    activeGame.investigator1,
    activeGame.investigator2 ?? undefined
  );
  updateActive({ ...activeGame, tracker });
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




  function deleteGame(id: string) {
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <div className="container py-8 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Arkham Horror LCG — Round Tracker</h1>
        <div className="flex items-center gap-2">
          <Select
            value={activeId ?? ""}
            onValueChange={(v) => setActiveId(v || null)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select saved game" />
            </SelectTrigger>
            <SelectContent>
              {games.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No games yet</div>}
              {games.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeGame && (
            <Button variant="destructive" size="sm" onClick={() => deleteGame(activeGame.id)}>
              Delete
            </Button>
          )}
        </div>
      </header>

      {!activeGame ? (
        <GameCreator onCreate={createGame} existingNames={games.map((g) => g.name)} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{activeGame.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Created: {new Date(activeGame.createdAt).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              <div className="text-sm">
                <span className="font-medium">Investigator 1:</span> {activeGame.investigator1.name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Investigator 2:</span>{" "}
                {activeGame.investigator2?.name ?? "—"}
              </div>
            </CardContent>
          </Card>

          <GameTrackerView
            game={activeGame}
            onUpdate={updateActive}
            onResetPhase={resetPhase}
            onResetAllPhases={resetAllPhases}
          />
        </div>
      )}
    </div>
  );
}

export default AHLCGTrackerPage;
