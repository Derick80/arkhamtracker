# **Arkham Horror LCG — Round & Phase Tracker**

A fully client-side React 19 module for tracking game rounds, investigator actions, and Arkham Horror LCG phase sequences. This module supports **1–4 investigators**, persists state in **localStorage**, and provides both **mobile-optimized** and **desktop-optimized** interfaces. It is implemented using **TypeScript**, **ShadCN UI**, and **TailwindCSS**.

This was inspired by a paper round tracker found on [BGG](https://boardgamegeek.com/filepage/223617/ahlcg-round-tracker-for-two-handed-solo)
---

## **Table of Contents**

1. [Overview](#overview)
2. [Features](#features)
3. [Data Model](#data-model)

   * [Game](#game)
   * [RoundTrackerState](#roundtrackerstate)
   * [InvestigatorTurn](#investigatorturn)
4. [Phase Logic](#phase-logic)
5. [Local Storage Integration](#local-storage-integration)
6. [Component Architecture](#component-architecture)
7. [Creating and Managing Games](#creating-and-managing-games)
8. [Mobile vs Desktop Layouts](#mobile-vs-desktop-layouts)
9. [Trouble Shooting](#Troubleshooting and Notes)

---

# **Overview**

This module implements a persistent round-based tracker for **Arkham Horror: The Card Game**, enabling players to record progress through each official phase:

1. **Mythos**
2. **Investigation** (per-investigator action pips)
3. **Enemy**
4. **Upkeep**

Each game supports configurable investigators, round advancement, full reset, and the ability to maintain multiple games simultaneously.

The component is fully client-side (`"use client"`) and can be embedded into any Next.js App Router application.

---

# **Features**

* ✔ **Create & manage multiple saved games**
* ✔ **Full 1–4 investigator support**
* ✔ **Auto-generated phase checklists**
* ✔ **Investigator action pips** (start-of-turn, 5 actions, end-of-turn)
* ✔ **Round advancement and reset**
* ✔ **Device-adaptive UI**

  * Mobile: compact vertical layout
  * Desktop: structured multi-column dashboard
* ✔ **Persistent storage via localStorage**
* ✔ **Strongly-typed and extensible models**

---

# **Data Model**

## **Game**

```ts
type Game = {
  id: string;
  name: string;
  createdAt: number;
  investigator1: SimpleInvestigator;
  investigator2?: SimpleInvestigator | null;
  investigator3?: SimpleInvestigator | null;
  investigator4?: SimpleInvestigator | null;
  tracker: RoundTrackerState;
};
```

Each game tracks the selected investigators and an embedded `RoundTrackerState` representing the current round.

---

## **RoundTrackerState**

```ts
type RoundTrackerState = {
  mythos: PhaseChecklistItem[];
  investigation: InvestigationPhase;
  enemy: PhaseChecklistItem[];
  upkeep: PhaseChecklistItem[];
  meta: { scenario?: string; date?: string; notes?: string };
  round: number;
};
```

This structure groups all four phases plus metadata.

### **PhaseChecklistItem**

```ts
type PhaseChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};
```

Used in Mythos, Enemy, and Upkeep phases.

---

## **InvestigatorTurn**

```ts
type InvestigatorTurn = {
  startOfTurn: boolean;
  actions: { id: string; checked: boolean }[];
  endOfTurn: boolean;
};
```

Each investigator receives:

* A start-of-turn toggle
* Five action toggles
* An end-of-turn toggle

This supports investigators with more than 3 actions (Leo de Luca, etc.).

---

# **Phase Logic**

The module provides base templates:

### Mythos

```ts
function baseMythos(firstRound: boolean): PhaseChecklistItem[]
```

Automatically filters steps based on number of investigators (e.g. hiding "Inv 4 encounter" for single-player).

### Investigation Phase

Generated dynamically:

```ts
function makeInvestigationPhase(inv1, inv2, inv3, inv4)
```

The phase includes an entry in `turns` for each active investigator.

### Enemy & Upkeep

Both phases load standard checklist templates, filtered by active investigator count.

---

# **Local Storage Integration**

### Keys

```ts
const LS_KEY = "ahlcg-games.v1";
const LS_ACTIVE_KEY = "ahlcg-active-game-id.v1";
```

### Loader & Saver Functions

```ts
function loadGames(): Game[]
function saveGames(games: Game[]): void
function loadActiveGameId(): string | null
function saveActiveGameId(id: string): void
```

This enables:

* Persistent game list
* Automatic restoration of last active game
* Crash-safe fallback behavior

---

# **Component Architecture**

```
Tracker
├── GameCreator
├── GameTrackerViewMobile
├── GameTrackerViewDesktop
├── InvestigatorTurnBlock
├── Checklist
├── SectionHeading
└── CompactRoundTracker
```

### **Tracker (root component)**

Coordinates:

* Loading/saving games
* Handling active game
* Deciding mobile/desktop rendering
* Forwarding update handlers to children

### **Checklist**

Generic grid-based UI for presenting toggles.

### **InvestigatorTurnBlock**

Displays a compact but structured per-investigator action tracker.

### **CompactRoundTracker**

Small UI module for showing/updating the round number.

---

# **Creating and Managing Games**

## Creating a New Game

The `GameCreator` component:

* Requests a name
* Allows selection of 1–4 investigators
* Prevents name duplication
* Builds a full initial `RoundTrackerState`

## Updating a Game

All phase mutations are routed through:

```ts
setChecklist(...)
setTurn(...)
setRound(...)
resetAllPhases(...)
```

These controlled update paths guarantee immutability and correct merging.

## Deleting a Game

```ts
deleteGame(id: string)
```

Removes the game from local storage and clears active selection when appropriate.

---

# **Mobile vs Desktop Layouts**

## **Mobile**

* Single-column
* Dense checklists
* Compact investigator action blocks
* Floating round tracker

## **Desktop**

* Multi-card dashboard layout
* Wide turn blocks
* Improved spacing
* Summary rows for metadata

This is controlled purely via Tailwind breakpoints (`md:hidden`, `hidden md:block`).

---


### Troubleshooting and Notes

I had some inital troubles with image names being capitalized or not depending on local vs production environment. 
git mv -f public/assets/images/Health.webp public/assets/images/_tmp_health.webp
git mv -f public/assets/images/_tmp_health.webp public/assets/images/health.webp

---

# **Summary**

This module provides a structured, extensible, and production-ready Arkham Horror LCG tracker built with TypeScript, React 19, ShadCN, and TailwindCSS. It offers a smooth UX, complete phase logic, persistent state, and clean abstractions suitable for future database integration.

---