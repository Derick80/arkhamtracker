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

export const getDBInvestigators = async () => {
  return await prisma.allInvestigators.findMany();
};
