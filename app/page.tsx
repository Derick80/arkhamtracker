import { getDBInvestigators } from "./actions/arkham-actions";
import Tracker from "./arkham/tracker";

export default async function Home() {
  const investigators = await getDBInvestigators();
  // console.log(investigators, "<-- investigators in page.tsx");
  if(!investigators) return null
  return (
    <div className="flex flex-col w-full gap-4">

      <Tracker initialInvestigators={investigators.map(inv => ({
        ...inv,
        faction_name: inv.faction_name ?? ""
      }))} />
      
    </div>
  );
}
