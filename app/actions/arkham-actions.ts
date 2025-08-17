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
 return await prisma.allInvestigators.findMany()
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
    const simpleInvestigator = filtered_investigatorCards.map((
      card
    ) => ({
      code: card.code,
      name: card.name,
      subname: card.subname,
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
})


export const createArkhamGame = async (
  prevState: unknown, formData: FormData
) =>{
const validatedData = createGameSchema.safeParse({
  gameName: formData.get("gameName"),
});
if (!validatedData.success) {
  return { error: validatedData.error };
}

const session = await auth();
if(!session || !session.user) {
  return { error: "Unauthorized" };
}
const userId = session.user.id;
if(!userId) {
return {error:'need auth'

}}

return await prisma.game.create({
  data: {
    name: validatedData.data.gameName,
    userId: userId,
  },
  include: {
    investigators: true,
  },
});}


export const getArkhamGames = async () => {
  const session = await auth();
  if( 
    !session || !session.user
  ){
  return {
    error:"must be authed"
  }
  }
  const userId = session.user.id;
  if(!userId) {
    return {
      error: "USerId not found"

    }
  }

  const games = await prisma.game.findMany({
    where: {
      userId: userId
    },
    include: {
      investigators: true,
    },
  });
  
  // return an empty array if there are no games
  return games
};


const addInvestigatorSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  investigatorCode: z.string().min(1, "Investigator ID/code is required"),
});

export const addInvestigator = async (
  prevState: unknown, formData:FormData
) =>{
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
  const {gameId, investigatorCode} = validatedData.data;

  const investigatorToSave = await prisma.allInvestigators.findUnique({
    where: {
      code: investigatorCode,
    },
  });
  if (!investigatorToSave) {
    return { error: "Investigator not found" };
  }

  return await prisma.investigator.create({
    data: {
      gameId: gameId,
      code: investigatorCode,
      name: investigatorToSave.name,
      subname: investigatorToSave.subname,
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
}



export const getGameById =async (gameId:string)=>{
  const game= await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      investigators: true,
    },
  });
  if (!game) {
    return null;
  } 

  const simpleGame = {
    id: game.id,
    name: game.name,
    investigators: game.investigators.map((inv) => ({
      investigatorId: inv.id,
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
      currentHealth:inv.currentHealth,
      currentSanity:inv.currentSanity,
      currentResources:inv.currentResources,
      actions:inv.actions
    })),
  };
  return simpleGame;
}


const deleteInvestigatorSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  investigatorId: z.string().min(1, "Investigator ID is required"),
});

export const deleteInvestigator = async (prevState: unknown,
  formdata:FormData
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
const {investigatorId, gameId} = validatedData.data;

console.log(investigatorId, "investigatorId")
  await prisma.investigator.delete({
    where: {
    id:investigatorId
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

  if (!gameId || !investigatorId || !["currentHealth", "currentSanity", "resources", "actions"].includes(field)) return;

  const gi = await prisma.investigator.findUnique({
    where: { id: investigatorId },
   
  });
  if (!gi) return;

  // Determine bounds
  const maxMap: Record<Field, number> = {
    currentHealth: gi.health ?? 8,  // sensible default
    currentSanity: gi.sanity ?? 8,  // sensible default
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

  const next = Math.max(minMap[field], Math.min(maxMap[field], currentVal + delta));

  const data: { currentHealth?: number; currentSanity?: number; currentResources?: number; actions?: number } = {};
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

  const spent = gi.actions ?? 0;          // current spent actions (0..4)
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