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
export type InvestigatorOption = {
  code: string;
  name: string;
};

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


// Minimal “cn” helper if you do not already have one:
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Checklist({
  items,
  onToggle,
}: {
  items: PhaseChecklistItem[];
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
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

      <CardContent className="p-">
        {name} — Turn
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground mb-1">Actions</span>
          <div className="flex gap-3">
            {state.actions.map((a, idx) => (
              <Checkbox
                key={a.id}
                checked={a.checked}
                onCheckedChange={(v) => onToggle(`action:${a.id}`, Boolean(v))}
                aria-label={`Action ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// ----------------- LocalStorage helpers -----------------
const LS_KEY = "ahlcg-games.v1";
const LS_ACTIVE_KEY = "ahlcg-active-game-id.v1";
function loadGames(): Game[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function saveGames(games: Game[]) { localStorage.setItem(LS_KEY, JSON.stringify(games)); }
function loadActiveGameId(): string | null { return localStorage.getItem(LS_ACTIVE_KEY); }
function saveActiveGameId(gameId: string) { localStorage.setItem(LS_ACTIVE_KEY, gameId); }

// ----------------- Phase templates -----------------
function baseMythos(): PhaseChecklistItem[] {
  return [
    { id: "doom", label: "Place 1 doom, check threshold", checked: false },
    { id: "enc1", label: "Investigator 1 encounter card", checked: false },
    { id: "enc2", label: "Investigator 2 encounter card", checked: false },
  ];
}
function baseEnemy(): PhaseChecklistItem[] {
  return [
    { id: "start", label: "Start of phase", checked: false },
    { id: "hunters", label: "Hunter enemies move", checked: false },
    { id: "attacks", label: "Enemies attack", checked: false },
  ];
}
function baseUpkeep(): PhaseChecklistItem[] {
  return [
    { id: "reset", label: "Ready cards / reset actions", checked: false },
    { id: "draw1", label: "Investigator 1 draw a card", checked: false },
    { id: "draw2", label: "Investigator 2 draw a card", checked: false },
    { id: "resources", label: "Each Investigator gains 1 resource", checked: false },
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
    console.log(inv1,"inv1")
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

// ----------------- Small UI bits -----------------
function SectionHeading({ roman, title }: { roman: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-l font-semibold">{roman}.</div>
      <div className="text-l font-semibold">{title}</div>
    </div>
  );
}

// ----------------- GameCreator -----------------
function GameCreator({
  investigators,
  onCreate,
  existingNames,
}: {
  investigators: SimpleInvestigator[];
  onCreate: (game: Game) => void;
  existingNames: string[];
}) {
    // console.log(investigators, "<investigators in GameCreator>");
  const [name, setName] = useState("");
  const [inv1, setInv1] = useState<string>("");
  const [inv2, setInv2] = useState<string>("none"); // sentinel for “no second investigator”

  const chosen1 = investigators?.find((i) => i.code === inv1) || null;
  console.log(chosen1, "<chosen1 in GameCreator>");
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
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Create a New Game</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Game Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g., The Gathering" />
            {nameTaken ? <p className="text-sm text-destructive">Name already exists.</p> : null}
          </div>

         <div 
         className="flex flex-row gap-2">
 <div className="space-y-2">
            <label className="text-sm font-medium">Investigator 1</label>
            <Select value={inv1} onValueChange={setInv1}>
              <SelectTrigger><SelectValue placeholder="Select investigator" /></SelectTrigger>
              <SelectContent>
                {investigators?.map((i) => (
                  <SelectItem key={i.code} value={i.code}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Investigator 2 (optional)</label>
            <Select value={inv2} onValueChange={setInv2}>
              <SelectTrigger><SelectValue placeholder="Select investigator (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {investigators?.filter((i) => i.code !== inv1).map((i) => (
                  <SelectItem key={i.code} value={i.code}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div></div>

        <Button className="w-full" disabled={!name.trim() || !inv1 || !!nameTaken} onClick={handleCreate}>
          Create Game
        </Button>
      </CardContent>
    </Card>
  );
}


type InvestigatorCard = {
  investigatorId: string;
  code: string;
  name: string;
  subname?: string | null;
  factionCode?: string;
  health: number;
  sanity: number;
  skill_willpower: number;
  skill_intellect: number;
  skill_combat: number;
  skill_agility: number;
  currentHealth?: number | null;
  currentSanity?: number | null;
  currentResources?: number | null;
  actions?: number | null;
};


// ----------------- GameTrackerView (unchanged logic) -----------------
// … keep your existing tracker view and phase reset functions here …
// (omitted for brevity — use your prior implementation)
function GameTrackerView({
  game,
  onUpdate,
  onResetPhase,
}: {
  game: Game;
  onUpdate: (next: Game) => void;
  onResetPhase: (phase: "mythos" | "investigation" | "enemy" | "upkeep") => void;
}) {
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


  // ——— Mythos/Enemy/Upkeep checklist toggles ———
  function setChecklist(
    phase: "mythos" | "enemy" | "upkeep",
    id: string,
    next: boolean
  ) {
    const list = tracker[phase].map((i) => (i.id === id ? { ...i, checked: next } : i));
    onUpdate({ ...game, tracker: { ...tracker, [phase]: list } });
  }

  // ——— Per-investigator turn toggles ———
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

  // ——— Reset All (optional) ———
  function resetAllPhases() {
    const fresh = initTracker(game.investigator1, game.investigator2 ?? null);
    onUpdate({ ...game, tracker: fresh });
  }

  return (
    <div className="space-y-6">
     
      {/* I. Mythos Phase */}
                <SectionHeading roman="I" title="MYTHOS PHASE" />

      <Card>
  
        <CardContent>
          <Checklist items={mythosItems} onToggle={(id, n) => setChecklist("mythos", id, n)} />
          
        </CardContent>
      </Card>
          <SectionHeading roman="II" title="INVESTIGATION PHASE" />

      {/* II. Investigation Phase */}
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
  
      {/* III. Enemy Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="III" title="ENEMY PHASE" />
          <div className="flex justify-end">
           
          </div>
        </CardHeader>
        <CardContent>
          <Checklist items={tracker.enemy} onToggle={(id, n) => setChecklist("enemy", id, n)} />
        </CardContent>
      </Card>

      {/* IV. Upkeep Phase */}
      <Card>
        <CardHeader className="space-y-3">
          <SectionHeading roman="IV" title="UPKEEP PHASE" />
          <div className="flex justify-end">
       
          </div>
        </CardHeader>
        <CardContent>
          <Checklist items={upkeepItems} onToggle={(id, n) => setChecklist("upkeep", id, n)} />
        </CardContent>
      </Card>

 {/* Reset All Button */}
      <div className="flex justify-center pt-6">
        <Button variant="destructive" size="lg" onClick={resetAllPhases}>
          Reset All Phases
        </Button>

      </div>

      

      {/* Additional Investigator Slots */}
      <div className="grid gap-4 md:grid-cols-2">
        
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
  const [investigators, setInvestigators] = useState<SimpleInvestigator[]>(initialInvestigators);
  const [games, setGames] = useState<Game[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load games/active selection on mount
  useEffect(() => {
    const g = loadGames();
    const a = loadActiveGameId();
    setGames(g);
    setActiveId(a && g.some((x) => x.id === a) ? a : g[0]?.id ?? null);
  }, []);

  // Persist games/active selection
  useEffect(() => { saveGames(games); }, [games]);
  useEffect(() => { if (activeId) saveActiveGameId(activeId); }, [activeId]);

  const activeGame = useMemo(() => games.find((g) => g.id === activeId) || null, [games, activeId]);

  function createGame(game: Game) { setGames((prev) => [game, ...prev]); setActiveId(game.id); }
  function updateActive(next: Game) { setGames((prev) => prev.map((g) => (g.id === next.id ? next : g))); }
  function deleteGame(id: string) { setGames((prev) => prev.filter((g) => g.id !== id)); if (activeId === id) setActiveId(null); }

  // Phase resets
  function resetPhase(phase: "mythos" | "investigation" | "enemy" | "upkeep") {
    if (!activeGame) return;
    let tracker = activeGame.tracker;
    if (phase === "mythos") tracker = { ...tracker, mythos: baseMythos() };
    if (phase === "enemy") tracker = { ...tracker, enemy: baseEnemy() };
    if (phase === "upkeep") tracker = { ...tracker, upkeep: baseUpkeep() };
    if (phase === "investigation") {
      tracker = {
        ...tracker,
        investigation: makeInvestigationPhase(activeGame.investigator1, activeGame.investigator2 ?? undefined),
      };
    }
    updateActive({ ...activeGame, tracker });
  }

  return (
    <div className="container py-8 space-y-6">    

      {!activeGame ? (
        <GameCreator
          investigators={investigators}
          onCreate={createGame}
          existingNames={games.map((g) => g.name)}
        />
      ) : (
        <div className="space-y-6">
          
          <GameTrackerView
          
            
          game={activeGame} onUpdate={updateActive} onResetPhase={resetPhase} />
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
              <div className="text-sm"><span className="font-medium">Investigator 1:</span> {activeGame.investigator1.name}</div>
              <div className="text-sm"><span className="font-medium">Investigator 2:</span> {activeGame.investigator2?.name ?? "—"}</div>
            </CardContent>
          </Card>

        <div 
        className="flex flex-row w-full justify-between">
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
      )}
      <div className="mb-12 flex items-center gap-2">
          {activeGame && (
            <Button variant="destructive" size="sm" onClick={() => deleteGame(activeGame.id)}>
              Reset Game
            </Button>
          )}
         
        </div>
    </div>
  );
}
