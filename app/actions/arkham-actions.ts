"use server";

import { auth } from "@/auth";
import { ArkhamInvestigatorCard } from "@/lib/arkham-types";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { tr } from "zod/v4/locales";
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


const createCampaignSchema = z.object({
  campaignName: z.string().min(1),
  scenarioName: z.string().min(1),
  investigators: z.array(z.string()).min(1).max(4),
});


export const createCampaign = async (prevState:any, formData: FormData) => {
const validatedData = createCampaignSchema.parse({
    campaignName: formData.get("campaignName"),
    scenarioName: formData.get("scenarioName"),
    investigators: [
        formData.get("investigator1"),
        formData.get("investigator2"),
        formData.get("investigator3"),
        formData.get("investigator4"),
    ].filter((inv): inv is string => typeof inv === "string" && inv !== "none"),
});

if(!validatedData){
    throw new Error("Invalid form data");
}

const { campaignName, scenarioName, investigators } = validatedData;

const session = await auth();
if (!session?.user) {
    throw new Error("Unauthorized");
}

const userId = session.user.id;
if(!userId){
    throw new Error("User ID not found");
}

const investigatorRecords = await prisma.allInvestigators.findMany({
    where: {
        code: {
            in: investigators,
        },
    },
});

console.log("Investigator Records:", investigatorRecords);
if(investigatorRecords.length !== investigators.length){
    throw new Error("Some investigators not found");
}


const createdCampaign = await prisma.campaign.create({
    data: {
        name: campaignName,
        userId,
        scenarios: {
            create: {
                name: scenarioName,
                playerCount: investigators.length,
            },
        },
        investigators: {
            connect: investigatorRecords.map((inv) => ({
                id: inv.id,
            }))
        },
    },

    include: {
        scenarios: true,
    },

})
redirect(`/arkham/${createdCampaign.id}/scenario/${createdCampaign.scenarios[0].id}`);

};


export const getScenarioById = async (scenarioId: string) => {
  return await prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: {
      campaign: {
        include: {
          investigators: true,

      }
    },  },    

  });
}
