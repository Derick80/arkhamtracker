"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";
import ModeToggle from "./mode-toggle";

const BottomBar =()=> {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: Shift+/ (i.e., "?") opens the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Arkham Horror LCG Tracker</span>
            <span aria-hidden>•</span>
            <span className="hidden sm:inline">Local-only storage</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(true)}
              aria-label="About this app"
              className="gap-2"
            >
              <InfoIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Info dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>About this Tracker</DialogTitle>
            <DialogDescription>
              A lightweight Arkham Horror LCG helper built with Next.js, React, Tailwind, shadcn UI, and localStorage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Key features</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create a game with 1–4 investigators and auto-save progress.</li>
              <li>Round tracker: Mythos, Investigation, Enemy, Upkeep, Advance Round</li>
              <li>Build with Mobile in mind (Pixel Pro tested).</li>
              <li>Health/Sanity/Resources trackers persisted per game.</li>
              <li>Campaign notes that are not affected by “Reset All Phases.”</li>
            </ul>
            <p className="text-muted-foreground">
              Tip: Press <kbd className="rounded border px-1">?</kbd> to open this dialog.
            </p>
          </div>
somethings
<ModeToggle />
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BottomBar;