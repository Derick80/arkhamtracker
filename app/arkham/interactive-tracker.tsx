"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Investigator = {
  id: string;
  name: string;
  subname: string;
  imagesrc?: string | null;
};

const InteractiveTracker = ({ scenarioData }: { scenarioData: { campaign: { investigators: Investigator[] } } }) => {
  const investigators: Investigator[] = scenarioData?.campaign?.investigators ?? [];


  return (
    <div className="space-y-4 max-w-[480px] mx-auto">
      {/* === Mythos Phase === */}
      <p>there are

        {investigators.length} investigators
      </p>
      <SectionHeading roman="I" title="MYTHOS PHASE" className="text-base" />

      <Card className="border border-primary/30 shadow-sm">
        <CardContent className="grid gap-2">
          <Checklist
            items={baseMythos()}
            onToggle={(id, next) => {
              console.log(`Toggled ${id} to ${next}`);
            }}
            dense
            columns={1}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        
      </div>

      {/* === Investigation Phase === */}
      <SectionHeading roman="II" title="INVESTIGATION PHASE" className="text-sm" />

      {/* === Enemy Phase === */}
      <SectionHeading roman="III" title="ENEMY PHASE" className="text-sm" />

      {/* === Upkeep Phase === */}
      <SectionHeading roman="IV" title="UPKEEP PHASE" className="text-sm" />
    </div>
  );
};

export default InteractiveTracker;

function SectionHeading({
  roman,
  title,
  className,
}: {
  roman: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 mt-4", className)}>
      <div className="font-semibold">{roman}.</div>
      <div className="font-semibold">{title}</div>
    </div>
  );
}
// ----------------- Checklist -----------------
type PhaseChecklistItem = { id: string; label: string; checked: boolean };

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


const baseMythos = (
  firstRound: boolean = false
)=>{
  return [
    {id:"doom", label:"Place 1 doom (check threshold)",
      checked: firstRound
    },
    {
      id:"enc1" , label:"Inv 1 encounter",
      checked: firstRound
    },
    {
      id:"enc2" , label:"Inv 2 encounter",
      checked: firstRound
    },
    {
      id:"enc3" , label:"Inv 3 encounter",
      checked: firstRound
    },
    {id:"enc4" , label:"Inv 4 encounter",
      checked: firstRound
    },
  ]
}