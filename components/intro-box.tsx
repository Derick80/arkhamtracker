// components/login-info-box.tsx

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shield, Info, ChevronDown } from "lucide-react";
import SignIn from "./sign-in";
import { SignOut } from "./sign-out";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

/**
 * Collapsible LoginInfoBox
 * - Collapses to a slim bar; expands to your full card
 * - Persists open/closed state in localStorage
 */
export function LoginInfoBox({
  isAuthenticated,
  userName,
  defaultOpen = true,
  storageKey = "login-info-open",
}: {
  isAuthenticated: boolean;
  userName?: string | null;
  /** Initial open state (used on first render before localStorage kicks in) */
  defaultOpen?: boolean;
  /** localStorage key for persisting open/closed state */
  storageKey?: string;
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  // Load saved state on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setOpen(saved === "1");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, open ? "1" : "0");
    } catch {}
  }, [open, storageKey]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="max-w-4xl">
      {/* BAR (always visible) */}
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cx(
            "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2",
            "bg-muted hover:bg-muted/70 transition-colors"
          )}
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-medium">
              Why sign in with Discord?
            </span>
            <Badge variant={isAuthenticated ? "default" : "outline"} className="ml-1 shrink-0">
              {isAuthenticated ? "Signed in" : "Required"}
            </Badge>
          </span>
          <ChevronDown
            className={cx(
              "h-4 w-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>

      {/* CONTENT (shown only when open) */}
      <CollapsibleContent className="mt-2 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Why sign in with Discord?</CardTitle>
              <Badge variant={isAuthenticated ? "default" : "outline"}>
                {isAuthenticated ? "Signed in" : "Required"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Signing in lets you securely create and manage Arkham Horror LCG games.
              Your identity ties games to you so progress is saved and shareable.
            </div>

            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Save and resume games across devices.</li>
              <li>Create, track, and update scenarios without losing data.</li>
            </ul>

            <Alert className="mt-2">
              <AlertDescription className="flex items-start gap-2 text-sm">
                <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                We request basic Discord identity (and email if enabled) to associate your account.
              </AlertDescription>
            </Alert>

            {!isAuthenticated ? (
              <SignIn />
            ) : (
              <div className="text-sm">
                Welcome{userName ? `, ${userName}` : ""}. You can create and manage games now.
                {" "}or <SignOut />
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
