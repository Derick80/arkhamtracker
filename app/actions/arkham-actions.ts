"use server";

import { prisma } from "@/lib/prisma";
import type { AllInvestigators } from "@/lib/generated/prisma";


export type SimpleInvestigator = {
  code: string;
  name: string;
  subname: string;
  faction_name: string;
  health: number;
  sanity: number;
  skill_willpower: number;
  skill_intellect: number;
  skill_combat: number;
  skill_agility: number;
  real_text: string;
  imagesrc: string;
}
export type TypeInvestigator = AllInvestigators & {
  investigatorId: string;
  currentHealth: number;
  currentSanity: number;
  resources: number;
  actions: number;
};

export const getDBInvestigators = async () => {
  return await prisma.allInvestigators.findMany();
};
