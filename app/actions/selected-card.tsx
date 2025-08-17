// app/games/[gameId]/investigator-cards.tsx
// Server component (presentational). No client code required.

import ActionPips from "./action-pips";
import HealthTracker from "./health-tracker";
import SanityTracker from "./sanity-tracker";

type CardInv = {
  investigatorId: string;
  code: string;
  name: string;
  subname?: string | null;
  // faction may not be present in DB copy; keep optional for now
  factionCode?: string;
  factionName?: string;
  health: number;
  sanity: number;
  skill_willpower: number;
  skill_intellect: number;
  skill_combat: number;
  skill_agility: number;
  currentHealth?: number | null;
  actions?: number | 0;
};

export default function InvestigatorCardGrid({ selected, gameId }: { selected: CardInv[], gameId:string }) {
    console.log(selected, "selected")
  if (!selected.length) {
    return (
      <div className="rounded-2xl border p-4">
        <p className="text-sm text-muted-foreground">No investigators yet.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {selected.map((inv) => (
        <li key={inv.name} className="rounded-2xl border overflow-hidden bg-white dark:bg-neutral-950">
          {/* Faction color bar */}
          <div className={`h-1 w-full ${factionBar(inv.factionCode ?? "")}`} />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">{inv.name}</h3>
                {inv.subname ? (
                  <p className="truncate text-sm italic text-neutral-500 dark:text-neutral-400">{inv.subname}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-neutral-500">{inv.code}</span>
            </div>

            {/* Health / Sanity */}
            <div className="mt-3 flex items-center gap-3 text-sm">
              {inv.factionName ? <Badge label={inv.factionName} /> : null}
              <span className="ml-auto tabular-nums">❤️ {inv.health}</span>
              <span className="tabular-nums">🧠 {inv.sanity}</span>
            </div>

            {/* Skills */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              <SkillTile abbr="Will" title="Willpower" value={inv.skill_willpower} />
              <SkillTile abbr="Int" title="Intellect" value={inv.skill_intellect} />
              <SkillTile abbr="Com" title="Combat" value={inv.skill_combat} />
              <SkillTile abbr="Agi" title="Agility" value={inv.skill_agility} />
            </div>
            {/* Health tracker */}
            <div className="mt-3">
              <HealthTracker
                key={inv.name}
                gameId={gameId}
                investigatorId={inv.investigatorId}
                max={inv.health}
                current={inv.currentHealth}
              />
            </div>
            {/* Sanity tracker */}
            <div className="mt-3">
              <SanityTracker
              key={inv.name}
                gameId={gameId}
                investigatorId={inv.investigatorId}
                max={inv.sanity}
                current={inv.currentSanity}
              />
            </div>
            
          </div>
              <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Actions</span>
                {typeof inv.actions === "number" ? (
                  <span className="tabular-nums text-neutral-500">
                    Remaining: {4 - Math.min(4, inv.actions)}
                  </span>
                ) : null}
              </div>
              <ActionPips gameId={gameId} investigatorId={inv.investigatorId} spent={Number(inv.actions ?? 0)} />
            </div>
        </li>

      ))}
    </ul>
  );
}

function SkillTile({ abbr, title, value }: { abbr: string; title: string; value: number }) {
  return (
    <div className="rounded-xl border p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{abbr}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums" aria-label={`${title}: ${value}`}>
        {value}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-200">
      {label}
    </span>
  );
}

function factionBar(code: string): string {
  switch (code?.toLowerCase()) {
    case "guardian":
      return "bg-gradient-to-r from-blue-600 to-blue-400";
    case "seeker":
      return "bg-gradient-to-r from-yellow-600 to-yellow-400";
    case "rogue":
      return "bg-gradient-to-r from-emerald-600 to-emerald-400";
    case "mystic":
      return "bg-gradient-to-r from-purple-600 to-purple-400";
    case "survivor":
      return "bg-gradient-to-r from-red-600 to-red-400";
    default:
      return "bg-gradient-to-r from-neutral-500 to-neutral-300";
  }
}
