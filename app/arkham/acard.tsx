// components/ahlcg/InvestigatorCards.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

/** ===== Utility: format rules text (tokens, line breaks) ===== */
function formatRulesText(text?: string) {
  if (!text) return null;

  // Token replacements resembling AHLCG style.
  const replacements: Array<[RegExp, (m: RegExpExecArray, i: number) => React.ReactNode]> = [
    [/\[reaction\]/gi, () => <Badge key={`b-reaction-${Math.random()}`} label="Reaction" symbol="⟲" />],
    [/\[fast\]/gi, () => <Badge key={`b-fast-${Math.random()}`} label="Fast" symbol="⚡" />],
    [/\[action\]/gi, () => <Badge key={`b-action-${Math.random()}`} label="Action" symbol="◆" />],
    [/\[free\]/gi, () => <Badge key={`b-free-${Math.random()}`} label="Free" symbol="◇" />],
    [/\[elder_sign\]/gi, () => <Badge key={`b-elder-${Math.random()}`} label="Elder Sign" symbol="✶" />],
    [/\[skull\]/gi, () => <Badge key={`b-skull-${Math.random()}`} label="Skull" symbol="☠" />],
    [/\[cultist\]/gi, () => <Badge key={`b-cult-${Math.random()}`} label="Cultist" symbol="✝" />],
    [/\[tablet\]/gi, () => <Badge key={`b-tab-${Math.random()}`} label="Tablet" symbol="◈" />],
    [/\[elder_thing\]/gi, () => <Badge key={`b-thing-${Math.random()}`} label="Elder Thing" symbol="❖" />],
    [/\[auto_fail\]/gi, () => <Badge key={`b-auto-${Math.random()}`} label="Auto-Fail" symbol="✗" />],
    [/\[wild\]/gi, () => <Badge key={`b-wild-${Math.random()}`} label="Wild" symbol="★" />],
  ];

  // Split on newlines and then apply token replacements segment-wise.
  const lines = text.split(/\n+/g);
  return (
    <div className="space-y-2 leading-snug">
      {lines.map((line, idx) => {
        const parts: Array<React.ReactNode> = [];
        let cursor = 0;

        // Walk through replacement patterns and rebuild
        while (cursor < line.length) {
          let earliest:
            | null
            | {
                match: RegExpExecArray;
                cb: (m: RegExpExecArray, i: number) => React.ReactNode;
              } = null;

          for (const [re, cb] of replacements) {
            re.lastIndex = cursor;
            const m = re.exec(line);
            if (m && (!earliest || m.index < earliest.match.index)) {
              earliest = { match: m, cb };
            }
          }

          if (!earliest) {
            parts.push(line.slice(cursor));
            break;
          }

          // push text before token
          if (earliest.match.index > cursor) {
            parts.push(line.slice(cursor, earliest.match.index));
          }

          // push converted token
          parts.push(earliest.cb(earliest.match, idx));

          // advance cursor
          cursor = earliest.match.index + earliest.match[0].length;
        }

        return (
          <p key={idx} className="text-[11px]">
            {parts.length ? parts : line}
          </p>
        );
      })}
    </div>
  );
}

/** ===== Small UI atoms ===== */
function Badge({ label, symbol }: { label: string; symbol: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium">
      <span aria-hidden>{symbol}</span>
      <span>{label}</span>
    </span>
  );
}

function StatPip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-[13px] font-bold shadow-sm">
        {value}
      </div>
      <div className="mt-1 text-[10px] tracking-wide uppercase text-stone-700">{label}</div>
    </div>
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
/** ===== Investigator card ===== */
function InvestigatorCard({
  inv,
  scale = 1,
}: {
  inv: AHLCGInvestigator;
  scale?: number;
}) {
  const theme = factionTheme(inv.faction_name || "Neutral");

  return (
    <Card
      className={[
        "relative rounded-xl w-full bg-gradient-to-b shadow-md ring-2 overflow-hidden",
        theme.ring,
      ].join(" ")}
      style={{
        // Trading-card-ish aspect ratio ~ 63x88 mm → 0.7159
        width: `${320 * scale}px`,
        aspectRatio: "63 / 88",
      }}
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
    stuff here
    </CardContent>
  </Card>
  )
}

/** ===== Public component: renders 1–2 cards from a game object ===== */
export default function InvestigatorCards({
  game,
  className,
  scale = 1,
}: InvestigatorCardsProps) {
  return (
    <div className="flex flex-row gap-6 justify-between"
>
      <InvestigatorCard inv={game.investigator1} scale={scale} />
      {game.investigator2 ? <InvestigatorCard inv={game.investigator2} scale={scale} /> : null}
    </div>
  );
}


