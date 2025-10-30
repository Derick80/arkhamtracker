"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ----------------- Types -----------------
export type PhaseChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

interface MythosChecklistProps {
  investigatorCount: number; // number of investigators (1–4)
  onChange?: (items: PhaseChecklistItem[]) => void;
  dense?: boolean;
  className?: string;
}

/**
 * Mythos Phase Checklist
 * Dynamically renders encounter boxes per investigator
 * and keeps two-column layout consistent with Tailwind grid.
 */
export function MythosChecklist({
  investigatorCount,
  onChange,
  dense = false,
  className,
}: MythosChecklistProps) {
  // Initialize the checklist items based on investigator count
  const [items, setItems] = React.useState<PhaseChecklistItem[]>(() =>
    Array.from({ length: investigatorCount }, (_, i) => ({
      id: `enc${i + 1}`,
      label: `Inv ${i + 1} encounter`,
      checked: false,
    })).concat([{ id: "doom", label: "Place 1 doom (check threshold)", checked: false }])
  );

  // Update items if investigator count changes
  React.useEffect(() => {
    setItems((prev) => {
      const updated = [
        { id: "doom", label: "Place 1 doom (check threshold)", checked: prev.find((x) => x.id === "doom")?.checked ?? false },
        ...Array.from({ length: investigatorCount }, (_, i) => {
          const id = `enc${i + 1}`;
          const existing = prev.find((x) => x.id === id);
          return { id, label: `Inv ${i + 1} encounter`, checked: existing?.checked ?? false };
        }),
      ];
      onChange?.(updated);
      return updated;
    });
  }, [investigatorCount, onChange]);

  // Toggle handler
  function handleToggle(id: string, next: boolean) {
    setItems((prev) => {
      const nextItems = prev.map((it) => (it.id === id ? { ...it, checked: next } : it));
      onChange?.(nextItems);
      return nextItems;
    });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2",
        dense && "gap-1",
        className
      )}
    >
      {items.map((item) => (
        <label
          key={item.id}
          htmlFor={`check-${item.id}`}
          className={cn(
            "flex items-center gap-2 rounded-lg border cursor-pointer transition-colors",
            dense ? "p-2" : "p-3",
            item.checked && "bg-muted"
          )}
        >
          <Checkbox
            id={`check-${item.id}`}
            className={dense ? "h-4 w-4" : "h-5 w-5"}
            checked={item.checked}
            onCheckedChange={(v) => handleToggle(item.id, Boolean(v))}
          />
          <span className={dense ? "text-xs" : "text-sm"}>{item.label}</span>
        </label>
      ))}
    </div>
  );
}
