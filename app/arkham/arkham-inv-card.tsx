// components/ahlcg/InvestigatorCards.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import * as React from "react";

/** ===== Types expected from your object ===== */
export type AHLCGInvestigator = {
  id: string;
  code: string;
  name: string;
  subname?: string;
  faction_name: "Guardian" | "Seeker" | "Rogue" | "Mystic" | "Survivor" | "Neutral" | string;
  health: number;
  sanity: number;
  skill_willpower: number;
  skill_intellect: number;
  skill_combat: number;
  skill_agility: number;
  real_text?: string;
  imagesrc?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AHLCGTrackerGame = {
  id: string;
  name: string;
  createdAt: number;
  investigator1: AHLCGInvestigator;
  investigator2?: AHLCGInvestigator | null;
  investigator3?: AHLCGInvestigator | null;
  investigator4?: AHLCGInvestigator | null;
  // other fields (tracker, notes) are ignored here
};

type InvestigatorCardsProps = {
  game: AHLCGTrackerGame;
  className?: string;
  /** Controls roughly how big to render; 1.0 ~= width 320px */
  scale?: number;
};

/** ===== Faction theming ===== */
const FACTION_THEME: Record<
  string,
  {
    ring: string; // border/outline color
    header: string; // header gradient or bg
    accent: string; // small accents
  }
> = {
  Guardian: {
    ring: "ring-blue-600",
    header: "from-blue-600 to-blue-800",
    accent: "text-blue-700",
  },
  Seeker: {
    ring: "ring-amber-600",
    header: "from-amber-600 to-amber-800",
    accent: "text-amber-700",
  },
  Rogue: {
    ring: "ring-emerald-600",
    header: "from-emerald-600 to-emerald-800",
    accent: "text-emerald-700",
  },
  Mystic: {
    ring: "ring-violet-600",
    header: "from-violet-600 to-violet-800",
    accent: "text-violet-700",
  },
  Survivor: {
    ring: "ring-rose-600",
    header: "from-rose-600 to-rose-800",
    accent: "text-rose-700",
  },
  Neutral: {
    ring: "ring-stone-500",
    header: "from-stone-500 to-stone-700",
    accent: "text-stone-700",
  },
};

function factionTheme(faction: string) {
  return FACTION_THEME[faction] ?? FACTION_THEME["Neutral"];
}


// ---- utilities: persisted number with clamping ----
function clamp(n: number) {
  return Math.max(0, Math.min(40, n));
}

function usePersistedNumber(storageKey: string, initial: number) {
  const [value, setValue] = React.useState<number>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage on mount OR when key changes
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null) {
        const parsed = Number(JSON.parse(raw));
        if (!Number.isNaN(parsed)) setValue(parsed);
        else setValue(initial);
      } else {
        setValue(initial);
      }
    } catch {
      setValue(initial);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist when value changes
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {}
  }, [hydrated, storageKey, value]);

  return { value, setValue, hydrated };
}


function SkillTile({
  icon,
  abbr,
  title,
  value,
}: {
  icon: string;
  abbr: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border text-center">
      <div className="flex items-center justify-center gap-1">
        <Image src={icon} alt={`${title} icon`} width={18} height={18} />
        <div className="text-[10px] uppercase tracking-wide text-primary">
          {abbr}
        </div>
      </div>
      <div
        className="mt-0 text-xl font-semibold tabular-nums"
        aria-label={`${title}: ${value}`}
      >
        {value}
      </div>
    </div>
  );
}


// ---- Health tracker (uses the hook above) ----
function HealthTracker({
  storageKey,
  baseHealth,
  type
}: {
  storageKey: string;
  baseHealth: number;
  type: "health" | "sanity" | "resources"
}) {
  const { value, setValue, hydrated } = usePersistedNumber(storageKey, baseHealth);

  console.log(type,"Health Tracker  ")
  // capitalize first letter for display
  // Avoid jarring SSR/CSR mismatch: show base until hydrated, then real value
  const display = hydrated ? value : baseHealth;
  return (
    <div className="flex items-center justify-between rounded-lg border p-2">
      <div className="flex items-center space-x-1">
        <Image
          src={`/assets/images/${type.toLowerCase()}.webp`}
          alt={`${type} icon`}
          width={24}
          height={24}
        />
        <span className="text-[10px] uppercase tracking-wide text-foreground">
            {type === "health" ? "Health" : type === "sanity" ? "Sanity" : "Res"}
        </span>
        
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-lg"
          onClick={() => setValue((v) => clamp(v - 1))}
          aria-label={`Decrease ${type === "health" ? "health" : type === "sanity" ? "sanity" : "resources"}`}
        >
          –
        </Button>

        <div
          className="w-12 text-center text-xl font-semibold tabular-nums"
          aria-label={`Current ${type === "health" ? "health" : type === "sanity" ? "sanity" : "resources"}: ${display}`}
        >
          {display}
        </div>

        <Button
          type="button"
          size='icon'
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-lg"
          onClick={() => setValue((v) => clamp(v + 1,))}
          aria-label={`Increase ${type === "health" ? "health" : type === "sanity" ? "sanity" : "resources"}`}
        >
          +
        </Button>

        <Button
          type="button"
          size='icon'
          className="ml-2 inline-flex h-8 items-center justify-center rounded-md border px-2 text-xs"
          onClick={() => setValue(baseHealth)}
          aria-label={`Reset ${type === "health" ? "health" : type === "sanity" ? "sanity" : "resources"}`}
          title="Reset to max"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}


/** ===== Investigator card ===== */
function InvestigatorCard({
  inv,
  gameId,
    storageKeyPrefix = "ahlcg:health", // <-- new (optional) prefix

}: {
  inv: AHLCGInvestigator;
  gameId: string;
  storageKeyPrefix?: string;
}) {
  const theme = factionTheme(inv.faction_name || "Neutral");
  // Compose a stable per-investigator storage key
  const storageKey = React.useMemo(
    () => `${storageKeyPrefix}:${gameId ?? "global"}:${inv.code}`,
    [storageKeyPrefix, gameId, inv.code]
  );

  const sanityStorageKey = React.useMemo(
    () => `${storageKeyPrefix}:${gameId ?? "global"}:${inv.code}:sanity`,
    [storageKeyPrefix, gameId, inv.code]
  );



type ElderSplit = { before: string; after: string } | null;

/** Split on the first [elder_sign] token.
 *  - Case-insensitive
 *  - Ignores surrounding whitespace
 *  - Preserves everything else (including [[Tome]] and [action] tokens)
 */
 function splitOnElderSign(text: string): ElderSplit {
  const re = /^(.*?)(?:\s*\[elder_sign\]\s*)([\s\S]*)$/i;
  const m = re.exec(text);
  if (!m) return null;
  return { before: m[1].trim(), after: m[2].trim() };
}

const { before, after } = splitOnElderSign(inv.real_text ?? "") || {};
console.log(before, after, "<-- split elder sign");
  return (
    <Card
      className={[
        "relative rounded-xl w-full bg-gradient-to-b shadow-md ring-2 overflow-hidden",
        theme.ring,
      ].join(" ")}
    
    >
      {/* Header band */}
      <CardHeader
        className={[
          "absolute top-0 left-0 right-0 h-12 bg-gradient-to-r text-white",
          theme.header,
        ].join(" ")}
      >
        <div className="flex h-full items-center justify-between px-3">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold leading-none">
              {inv.name}
            </div>
            {inv.subname ? (
              <div className="truncate text-[11px] opacity-90">{inv.subname}</div>
            ) : null}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide">Investigator</div>
            <div className={["text-[10px] font-medium", theme.accent].join(" ")}>
              {inv.faction_name}
            </div>
          </div>
        </div>
      </CardHeader>
    <CardContent
    
    >

     <div className="grid grid-cols-4 gap-4 p-4 mt-4">
       <SkillTile
         icon="/assets/images/Willpower01.webp"
         abbr="WIL"
         title="Willpower"
         value={inv.skill_willpower}
       />
       <SkillTile
         icon="/assets/images/Intellect01.webp"
         abbr="INT"
         title="Intellect"
         value={inv.skill_intellect}
       />
       <SkillTile
         icon="/assets/images/Combat01.webp"
         abbr="COM"
         title="Combat"
         value={inv.skill_combat}
       />
       <SkillTile
         icon="/assets/images/Agility01.webp"
         abbr="AGI"
         title="Agility"
         value={inv.skill_agility}
       />
    </div>
    <HealthTracker storageKey={storageKey} baseHealth={inv.health}
    type="health"
    />
    <HealthTracker storageKey={sanityStorageKey} baseHealth={inv.sanity}
    type="sanity"
    />
    <HealthTracker storageKey={sanityStorageKey} baseHealth={5}
    type="resources"
    />
    </CardContent>
    <CardFooter>
      {/* add the investigators ability and mystic symbol ability */}
      <div className="text-sm">
        <div className="font-semibold">Abilities</div>
        <div>{inv.real_text}</div>
      </div>
     
    </CardFooter>
  </Card>
  )
}

/** ===== Public component: renders 1–2 cards from a game object ===== */
export default function InvestigatorCards({
  game,
}: InvestigatorCardsProps) {
    console.log(game, "<game in InvestigatorCards>");
  return (
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <InvestigatorCard inv={game.investigator1}
        gameId={game.id}
      />
      {game.investigator2 ? <InvestigatorCard inv={game.investigator2} gameId={game.id} /> : null}
      {game.investigator3 ? <InvestigatorCard inv={game.investigator3} gameId={game.id} /> : null}
      {game.investigator4 ? <InvestigatorCard inv={game.investigator4} gameId={game.id} /> : null}
    </div>
  );
}


