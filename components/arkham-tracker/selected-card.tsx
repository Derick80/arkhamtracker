"use client";
// app/games/[gameId]/investigator-cards.tsx
// Server component (presentational). No client code required.

import { Button } from "@/components/ui/button";
import ActionPips from "./action-pips";
import { deleteInvestigator } from "../../app/actions/arkham-actions";
import HealthTracker from "./health-tracker";
import ResourcesTracker from "./resources-tracker";
import SanityTracker from "./sanity-tracker";
import Image from "next/image";
import { useActionState, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

export default function InvestigatorCardGrid({
  selected,
  gameId,
}: {
  selected: InvestigatorCard[];
  gameId: string;
}) {
  const [, action, isPending] = useActionState(deleteInvestigator, null);
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
        <InvestigatorCardItem
          key={inv.investigatorId}
          inv={inv}
          gameId={gameId}
          action={action}
          isPending={isPending}
        />
      ))}
    </ul>
  );
}

type DeleteAction = (formData: FormData) => void | Promise<void>;
function InvestigatorCardItem({
  inv,
  gameId,
  action,
  isPending,
}: {
  inv: InvestigatorCard;
  gameId: string;
  action: DeleteAction;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false); // start hidden
  return (
    <li
      className={`relative rounded-2xl border overflow-hidden bg-card text-card-foreground transition-all duration-300 ${open ? "p-0" : "scale-95 opacity-90"}`}
    >
      {/* Faction color bar */}
      <div className={`h-2 w-full ${factionBar(inv.factionCode || "")}`} />
      <div className="p-4">
        {/* Header */}
        <div className="relative flex items-baseline justify-between gap-3 pr-14">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{inv.name}</h3>
            {inv.subname ? (
              <p className="truncate text-sm italic text-muted-foreground">
                {inv.subname}
              </p>
            ) : null}
          </div>
        </div>
        {/* Skills */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <SkillTile
            icon="/assets/images/Willpower01.webp"
            abbr="Will"
            title="Willpower"
            value={inv.skill_willpower}
          />
          <SkillTile
            icon="/assets/images/Intellect01.webp"
            abbr="Int"
            title="Intellect"
            value={inv.skill_intellect}
          />
          <SkillTile
            icon="/assets/images/Combat01.webp"
            abbr="Com"
            title="Combat"
            value={inv.skill_combat}
          />
          <SkillTile
            icon="/assets/images/Agility01.webp"
            abbr="Agi"
            title="Agility"
            value={inv.skill_agility}
          />
        </div>
        {/* Toggle + Remove buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            aria-label={
              open
                ? `Hide details for ${inv.name}`
                : `Show details for ${inv.name}`
            }
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
          <form
            action={action}
            onSubmit={(e) => {
              if (!window.confirm(`Remove ${inv.name} from game?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="gameId" value={gameId} />
            <input
              type="hidden"
              name="investigatorId"
              value={inv.investigatorId}
            />
            <Button
              type="submit"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              aria-label={`Remove ${inv.name} from game`}
              title="Remove from game"
              disabled={isPending}
            >
              <span className="text-lg leading-none">
                <XIcon />
              </span>
            </Button>
          </form>
        </div>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-300 ${open ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          aria-hidden={!open}
        >
          {/* Health / Sanity summary */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1 tabular-nums">
                <Image
                  src="/assets/images/Health.webp"
                  alt="Health"
                  width={16}
                  height={16}
                />
                <span>{inv.health}</span>
              </div>
              <div className="flex items-center gap-1 tabular-nums">
                <Image
                  src="/assets/images/Sanity.webp"
                  alt="Sanity"
                  width={16}
                  height={16}
                />
                <span>{inv.sanity}</span>
              </div>
            </div>
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
          <Separator className="mt-2 ml-auto" />
          {/* Resources tracker */}
          <div className="mt-3">
            <ResourcesTracker
              key={`${inv.name}-res`}
              gameId={gameId}
              investigatorId={inv.investigatorId}
              current={inv.currentResources}
            />
          </div>
        </div>
      </div>
      {/* Actions always visible */}
      <div className="mt-0">
        <div className="mb-1 flex items-center justify-between text-sm p-2">
          <span>Actions</span>
          {typeof inv.actions === "number" ? (
            <span className="tabular-nums text-muted-foreground">
              Remaining: {4 - Math.min(4, inv.actions)}
            </span>
          ) : null}
        </div>
        <ActionPips
          gameId={gameId}
          investigatorId={inv.investigatorId}
          spent={Number(inv.actions ?? 0)}
        />
      </div>
    </li>
  );
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

// Removed unused Badge component

function factionBar(faction_name: string): string {
  console.log(faction_name, "<faction name in factionBar>");
  switch (faction_name?.toLowerCase()) {
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
