"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resetAllTracks } from "./arkham-actions";

export default function ResetAllButton({ gameId }: { gameId: string }) {
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    const formData = new FormData();
    formData.set("gameId", gameId);
    startTransition(async () => {
      await resetAllTracks(formData);
      // Let client components update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("arkham:reset-all"));
      }
    });
  };

  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={pending}>
      Reset All Tracks
    </Button>
  );
}
