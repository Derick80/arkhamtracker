import { SimpleInvestigator } from "@/app/actions/arkham-actions";
import { ArkhamInvestigatorCard } from "@/lib/arkham-types";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Deleting all records...");

  await prisma.$transaction([
    prisma.allInvestigators.deleteMany(),
  ]);

  console.log("All tables cleared!");
// call the arkhamdb api and fetch all investigators then create many
  const response = await fetch("https://arkhamdb.com/api/public/cards/?_format=json");
  const data = await response.json() as ArkhamInvestigatorCard[];

  const investigators = data.filter((card) => card.type_code === "investigator") as SimpleInvestigator[];
  console.log(`Seeding ${investigators.length} investigators...`);
  console.log(investigators.map((card) => card.faction_name));
  await prisma.allInvestigators.createMany({
    data: investigators.map((card) => ({
      code: card.code,
      name: card.name,
      subname: card.subname,
      health: card.health,
      sanity: card.sanity,
      faction_name: card.faction_name,
      skill_willpower: card.skill_willpower,
      skill_intellect: card.skill_intellect,
      skill_combat: card.skill_combat,
      skill_agility: card.skill_agility,
      real_text: card.real_text,
      imagesrc: card.imagesrc || "",
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
