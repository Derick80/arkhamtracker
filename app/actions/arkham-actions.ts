"use server";

import { auth } from "@/auth";
import { ArkhamInvestigatorCard } from "@/lib/arkham-types";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";

export type SimpleInvestigator = Pick<
  ArkhamInvestigatorCard,
  | "code"
  | "name"
  | "subname"
  | "faction_name"
  | "health"
  | "sanity"
  | "skill_willpower"
  | "skill_intellect"
  | "skill_combat"
  | "skill_agility"
  | "real_text"
  | "imagesrc"
>;

export type TypeInvestigator = SimpleInvestigator & {
  investigatorId: string;
  currentHealth: number;
  currentSanity: number;
  resources: number;
  actions: number;
};

export const getDBInvestigators = async (): Promise<SimpleInvestigator[]> => {
  return await prisma.allInvestigators.findMany();
};

export const getAllInvestigators = async (): Promise<SimpleInvestigator[]> => {
  try {
    const response = await fetch(
      "https://arkhamdb.com/api/public/cards/?_format=json",
    );
    if (!response.ok) {
      throw new Error(
        `HTTP error! Failed to fetch from Arkhamdb status: ${response.status}`,
      );
    }
    const allCards: ArkhamInvestigatorCard[] = await response.json();
    const investigatorCards = allCards.filter(
      (card) => card.type_code === "investigator",
    );
    // filter duplications
    const filtered_investigatorCards = investigatorCards.filter(
      (card, index, self) =>
        index === self.findIndex((c) => c.code === card.code),
    );
    // console.log(filtered_investigatorCards, "filtered_investigatorCards");
    const simpleInvestigator = filtered_investigatorCards.map((card) => ({
      code: card.code,
      name: card.name,
      subname: card.subname,
      faction_name: card.faction_name,
      health: card.health,
      sanity: card.sanity,
      skill_willpower: card.skill_willpower,
      skill_intellect: card.skill_intellect,
      skill_combat: card.skill_combat,
      skill_agility: card.skill_agility,
      real_text: card.real_text,
      imagesrc: card.imagesrc || "",

      // Add any additional filtering or transformation logic here
    }));

    return simpleInvestigator;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const createGameSchema = z.object({
  gameName: z.string().min(1, "Game name is required"),
  scenario: z.string().min(1, "Scenario is required"),
});

export const createArkhamGame = async (
  prevState: unknown,
  formData: FormData,
) => {
  const validatedData = createGameSchema.safeParse({
    gameName: formData.get("gameName"),
    scenario: formData.get("scenario"),
  });
  if (!validatedData.success) {
    return { error: validatedData.error };
  }

  const session = await auth();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;
  if (!userId) {
    return { error: "need auth" };
  }

  const { gameName, scenario } = validatedData.data;
  await prisma.game.create({
    data: {
      name: gameName,
      scenario: scenario,
      userId: userId,
    },
    include: {
      investigators: true,
    },
  });
  revalidatePath(`/}`);
};

export const getArkhamGames = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      error: "must be authed",
    };
  }
  const userId = session.user.id;
  if (!userId) {
    return {
      error: "USerId not found",
    };
  }

  const games = await prisma.game.findMany({
    where: {
      userId: userId,
    },
    include: {
      investigators: true,
    },
  });

  // return an empty array if there are no games
  return games;
};

const addInvestigatorSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  investigatorCode: z.string().min(1, "Investigator ID/code is required"),
});

export const addInvestigator = async (
  prevState: unknown,
  formData: FormData,
) => {
  const validatedData = addInvestigatorSchema.safeParse({
    gameId: formData.get("gameId"),
    investigatorCode: formData.get("investigatorCode"),
  });
  const session = await auth();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;
  if (!userId) {
    return { error: "UserId not found" };
  }
  if (!validatedData.success) {
    return { error: validatedData.error };
  }
  const { gameId, investigatorCode } = validatedData.data;

  // Enforce max of 2 investigators per game (server-side guard)
  const currentCount = await prisma.investigator.count({
    where: { gameId },
  });
  if (currentCount >= 2) {
    return { error: "Maximum of 2 investigators reached for this game" };
  }

  const investigatorToSave = await prisma.allInvestigators.findUnique({
    where: {
      code: investigatorCode,
    },
  });
  if (!investigatorToSave) {
    return { error: "Investigator not found" };
  }
  const isAlreadyInGame = await prisma.investigator.findFirst({
    where: {
      gameId: gameId,
      code: investigatorCode,
    },
  });
  if (isAlreadyInGame) {
    return { error: "Investigator already added" };
  }

  const created = await prisma.investigator.create({
    data: {
      gameId: gameId,
      code: investigatorCode,
      name: investigatorToSave.name,
      subname: investigatorToSave.subname,
      faction_name: investigatorToSave.faction_name,
      health: investigatorToSave.health,
      sanity: investigatorToSave.sanity,
      skill_willpower: investigatorToSave.skill_willpower,
      skill_intellect: investigatorToSave.skill_intellect,
      skill_combat: investigatorToSave.skill_combat,
      skill_agility: investigatorToSave.skill_agility,
      real_text: investigatorToSave.real_text,
      imagesrc: investigatorToSave.imagesrc || "",
    },
  });
  console.log(created, "created investigator");
  if (!created) {
    return { error: "Failed to add investigator" };
  }
  revalidatePath(`/${gameId}`);
  return { success: true };
};

export const getGameById = async (gameId: string) => {
  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      // Enforce stable ordering so UI card positions don't swap after updates
      investigators: {
        orderBy: { createdAt: "asc" },
      }, // includes faction_name field on Investigator model
    },
  });
  if (!game) {
    return null;
  }

  // Local type reflecting the Investigator model including optional runtime fields
  type InvestigatorRecord = (typeof game.investigators)[number] & {
    faction_name?: string | null;
  };

  const simpleGame = {
    id: game.id,
    name: game.name,
    scenario: game.scenario,
    notes: game.notes,
    investigators: (game.investigators as InvestigatorRecord[]).map((inv) => ({
      investigatorId: inv.id,
      // Normalize naming for client components expecting factionName / factionCode
      factionName: inv.faction_name,
      factionCode: inv.faction_name
        ? inv.faction_name.toLowerCase()
        : undefined,
      name: inv.name,
      code: inv.code,
      subname: inv.subname,
      health: inv.health,
      sanity: inv.sanity,
      skill_willpower: inv.skill_willpower,
      skill_intellect: inv.skill_intellect,
      skill_combat: inv.skill_combat,
      skill_agility: inv.skill_agility,
      real_text: inv.real_text,
      imagesrc: inv.imagesrc,
      // Add any additional fields you want to include
      currentHealth: inv.currentHealth,
      currentSanity: inv.currentSanity,
      currentResources: inv.currentResources,
      actions: inv.actions,
    })),
  };
  return simpleGame;
};

const deleteInvestigatorSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  investigatorId: z.string().min(1, "Investigator ID is required"),
});

export const deleteInvestigator = async (
  prevState: unknown,
  formdata: FormData,
) => {
  const session = await auth();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;
  if (!userId) {
    return { error: "UserId not found" };
  }

  const validatedData = deleteInvestigatorSchema.safeParse({
    gameId: formdata.get("gameId"),
    investigatorId: formdata.get("investigatorId"),
  });
  if (!validatedData.success) {
    return { error: validatedData.error };
  }
  const { investigatorId, gameId } = validatedData.data;

  console.log(investigatorId, "investigatorId");
  await prisma.investigator.delete({
    where: {
      id: investigatorId,
    },
  });
  revalidatePath(`/${gameId}`);
};

type Field = "currentHealth" | "currentSanity" | "resources" | "actions";

// Generic stat updater with clamping
export async function updateStat(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const investigatorId = String(formData.get("investigatorId") ?? "");
  const field = String(formData.get("field") ?? "") as Field;
  const delta = Number(formData.get("delta") ?? 0);

  if (
    !gameId ||
    !investigatorId ||
    !["currentHealth", "currentSanity", "resources", "actions"].includes(field)
  )
    return;

  const gi = await prisma.investigator.findUnique({
    where: { id: investigatorId },
  });
  if (!gi) return;

  // Determine bounds
  const maxMap: Record<Field, number> = {
    currentHealth: gi.health ?? 8, // sensible default
    currentSanity: gi.sanity ?? 8, // sensible default
    resources: 5,
    actions: 4, // clamp to small number; typical round uses 3
  };
  const minMap: Record<Field, number> = {
    currentHealth: 0,
    currentSanity: 0,
    resources: 0,
    actions: 0,
  };

  let currentVal: number;
  switch (field) {
    case "currentHealth":
      currentVal = gi.currentHealth ?? maxMap.currentHealth;
      break;
    case "currentSanity":
      currentVal = gi.currentSanity ?? maxMap.currentSanity;
      break;
    case "resources":
      currentVal = gi.currentResources ?? 5;
      break;
    case "actions":
      currentVal = gi.actions ?? 0;
      break;
  }

  // For resources, allow unlimited increase (no upper cap). Others remain clamped to [min..max].
  const next =
    field === "resources"
      ? Math.max(minMap.resources, currentVal + delta)
      : Math.max(minMap[field], Math.min(maxMap[field], currentVal + delta));

  const data: {
    currentHealth?: number;
    currentSanity?: number;
    currentResources?: number;
    actions?: number;
  } = {};
  if (field === "currentHealth") data.currentHealth = next;
  if (field === "currentSanity") data.currentSanity = next;
  if (field === "resources") data.currentResources = next;
  if (field === "actions") data.actions = next;

  await prisma.investigator.update({
    where: { id: investigatorId },
    data,
  });

  revalidatePath(`/${gameId}`);
}

export async function toggleAction(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const investigatorId = String(formData.get("investigatorId") ?? "");
  const index = Number(formData.get("index") ?? -1); // 0..3
  if (!gameId || !investigatorId || index < 0 || index > 3) return;

  const gi = await prisma.investigator.findUnique({
    where: { id: investigatorId },
    select: { actions: true },
  });
  if (!gi) return;

  const spent = gi.actions ?? 0; // current spent actions (0..4)
  const nextSpent = index < spent ? index : index + 1; // toggle rule
  const clamped = Math.max(0, Math.min(4, nextSpent));

  await prisma.investigator.update({
    where: { id: investigatorId },
    data: { actions: clamped },
  });

  revalidatePath(`/${gameId}`);
}

/** Reset one investigator’s actions to 0. */
export async function resetInvestigatorActions(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const investigatorId = String(formData.get("investigatorId") ?? "");
  if (!gameId || !investigatorId) return;

  await prisma.investigator.update({
    where: { id: investigatorId },
    data: { actions: 0 },
  });

  revalidatePath(`/${gameId}`);
}

/** Reset ALL investigators in a game to 0 (End Round). */
export async function resetAllActions(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;

  await prisma.investigator.updateMany({
    where: { gameId },
    data: { actions: 0 },
  });

  revalidatePath(`/${gameId}`);
}

type MythosKey =
  | "mythosPlaceDoom"
  | "mythosDrawP1"
  | "mythosDrawP2"
  | "mythosEnd";

export async function getMythosState(gameId: string): Promise<{
  mythosPlaceDoom: boolean;
  mythosDrawP1: boolean;
  mythosDrawP2: boolean;
  mythosEnd: boolean;
}> {
  // Use raw query to avoid type coupling while migrations are pending
  const rows = (await prisma.$queryRawUnsafe(
    'SELECT "mythosPlaceDoom", "mythosDrawP1", "mythosDrawP2", "mythosEnd" FROM "Game" WHERE id = $1',
    gameId,
  )) as unknown as Array<Record<string, unknown>>;
  const row = rows?.[0] as unknown as
    | {
        mythosPlaceDoom?: boolean;
        mythosDrawP1?: boolean;
        mythosDrawP2?: boolean;
        mythosEnd?: boolean;
      }
    | undefined;
  return {
    mythosPlaceDoom: row?.mythosPlaceDoom ?? false,
    mythosDrawP1: row?.mythosDrawP1 ?? false,
    mythosDrawP2: row?.mythosDrawP2 ?? false,
    mythosEnd: row?.mythosEnd ?? false,
  };
}

/** Toggle a mythos checkbox for the given game. */
export async function toggleMythos(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const step = String(formData.get("step") ?? "") as MythosKey;
  const allowed: Record<MythosKey, string> = {
    mythosPlaceDoom: "mythosPlaceDoom",
    mythosDrawP1: "mythosDrawP1",
    mythosDrawP2: "mythosDrawP2",
    mythosEnd: "mythosEnd",
  };
  const col = allowed[step as MythosKey];
  if (!gameId || !col) return;

  // Flip the boolean: col = NOT COALESCE(col, false)
  await prisma.$executeRawUnsafe(
    `UPDATE "Game" SET "${col}" = NOT COALESCE("${col}", false) WHERE id = $1`,
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

/** Reset all mythos checkboxes to false for a game. */
export async function resetMythos(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;
  await prisma.$executeRawUnsafe(
    'UPDATE "Game" SET "mythosPlaceDoom"=false, "mythosDrawP1"=false, "mythosDrawP2"=false, "mythosEnd"=false WHERE id = $1',
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

// Enemies Phase
type EnemiesKey = "enemiesHunterMove" | "enemiesAttack";

export async function getEnemiesState(gameId: string): Promise<{
  enemiesHunterMove: boolean;
  enemiesAttack: boolean;
}> {
  const rows = (await prisma.$queryRawUnsafe(
    'SELECT "enemiesHunterMove", "enemiesAttack" FROM "Game" WHERE id = $1',
    gameId,
  )) as unknown as Array<Record<string, unknown>>;
  const row = rows?.[0] as
    | { enemiesHunterMove?: boolean; enemiesAttack?: boolean }
    | undefined;
  return {
    enemiesHunterMove: row?.enemiesHunterMove ?? false,
    enemiesAttack: row?.enemiesAttack ?? false,
  };
}

export async function toggleEnemies(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const step = String(formData.get("step") ?? "") as EnemiesKey;
  const allowed: Record<EnemiesKey, string> = {
    enemiesHunterMove: "enemiesHunterMove",
    enemiesAttack: "enemiesAttack",
  };
  const col = allowed[step as EnemiesKey];
  if (!gameId || !col) return;
  await prisma.$executeRawUnsafe(
    `UPDATE "Game" SET "${col}" = NOT COALESCE("${col}", false) WHERE id = $1`,
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

export async function resetEnemies(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;
  await prisma.$executeRawUnsafe(
    'UPDATE "Game" SET "enemiesHunterMove"=false, "enemiesAttack"=false WHERE id = $1',
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

// Upkeep Phase
type UpkeepKey =
  | "upkeepUnexhaust"
  | "upkeepDrawP1"
  | "upkeepDrawP2"
  | "upkeepGainRes"
  | "upkeepCheckHand";

export async function getUpkeepState(gameId: string): Promise<{
  upkeepUnexhaust: boolean;
  upkeepDrawP1: boolean;
  upkeepDrawP2: boolean;
  upkeepGainRes: boolean;
  upkeepCheckHand: boolean;
}> {
  const rows = (await prisma.$queryRawUnsafe(
    'SELECT "upkeepUnexhaust", "upkeepDrawP1", "upkeepDrawP2", "upkeepGainRes", "upkeepCheckHand" FROM "Game" WHERE id = $1',
    gameId,
  )) as unknown as Array<Record<string, unknown>>;
  const row = rows?.[0] as
    | {
        upkeepUnexhaust?: boolean;
        upkeepDrawP1?: boolean;
        upkeepDrawP2?: boolean;
        upkeepGainRes?: boolean;
        upkeepCheckHand?: boolean;
      }
    | undefined;
  return {
    upkeepUnexhaust: row?.upkeepUnexhaust ?? false,
    upkeepDrawP1: row?.upkeepDrawP1 ?? false,
    upkeepDrawP2: row?.upkeepDrawP2 ?? false,
    upkeepGainRes: row?.upkeepGainRes ?? false,
    upkeepCheckHand: row?.upkeepCheckHand ?? false,
  };
}

export async function toggleUpkeep(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const step = String(formData.get("step") ?? "") as UpkeepKey;
  const allowed: Record<UpkeepKey, string> = {
    upkeepUnexhaust: "upkeepUnexhaust",
    upkeepDrawP1: "upkeepDrawP1",
    upkeepDrawP2: "upkeepDrawP2",
    upkeepGainRes: "upkeepGainRes",
    upkeepCheckHand: "upkeepCheckHand",
  };
  const col = allowed[step as UpkeepKey];
  if (!gameId || !col) return;
  await prisma.$executeRawUnsafe(
    `UPDATE "Game" SET "${col}" = NOT COALESCE("${col}", false) WHERE id = $1`,
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

export async function resetUpkeep(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;
  await prisma.$executeRawUnsafe(
    'UPDATE "Game" SET "upkeepUnexhaust"=false, "upkeepDrawP1"=false, "upkeepDrawP2"=false, "upkeepGainRes"=false, "upkeepCheckHand"=false WHERE id = $1',
    gameId,
  );
  revalidatePath(`/${gameId}`);
}

/** Reset all phase trackers (Mythos, Enemies, Upkeep) and all investigators' actions to baseline. */
export async function resetAllTracks(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;

  await prisma.$transaction([
    // Reset all investigator actions to 0
    prisma.investigator.updateMany({ where: { gameId }, data: { actions: 0 } }),
    // Reset all boolean flags on Game for Mythos, Enemies, and Upkeep
    prisma.$executeRawUnsafe(
      'UPDATE "Game" SET ' +
        '"mythosPlaceDoom"=false, "mythosDrawP1"=false, "mythosDrawP2"=false, "mythosEnd"=false, ' +
        '"enemiesHunterMove"=false, "enemiesAttack"=false, ' +
        '"upkeepUnexhaust"=false, "upkeepDrawP1"=false, "upkeepDrawP2"=false, "upkeepGainRes"=false, "upkeepCheckHand"=false ' +
        "WHERE id = $1",
      gameId,
    ),
  ]);

  revalidatePath(`/${gameId}`);
}

const deleteGameSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteArkhamGame = async (prevState: any, formData: FormData) => {
  const validatedData = deleteGameSchema.safeParse({
    gameId: formData.get("gameId"),
  });
  if (!validatedData.success) {
    return { error: validatedData.error };
  }
  const { gameId } = validatedData.data;
  await prisma.game.delete({
    where: {
      id: gameId,
    },
  });
  revalidatePath(`/${gameId}`);
};

// create a function that updates the scenario string in a game
const updateScenarioSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  scenario: z.string().min(1, "Scenario is required"),
});
export const updateScenario = async (
  prevState: unknown,
  formData: FormData,
) => {
  const validatedData = updateScenarioSchema.safeParse({
    gameId: formData.get("gameId"),
    scenario: formData.get("scenario"),
  });
  if (!validatedData.success) {
    return { error: validatedData.error };
  }
  const { gameId, scenario } = validatedData.data;
  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      scenario,
    },
  });
  revalidatePath(`/${gameId}`);
};


 const updateNotesSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  notes: z.string().min(1, "Notes are required"),
});

export const updateNotes = async (
  formData: FormData,
  prevState: unknown
) => {
  const validatedData = updateNotesSchema.safeParse({
    gameId: formData.get("gameId"),
    notes: formData.get("notes"),
  });
  if (!validatedData.success) {
    return { error: validatedData.error };
  }
  const { gameId, notes } = validatedData.data;
  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      notes,
    },
  });
  revalidatePath(`/${gameId}`);
};
