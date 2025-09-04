import { getDBInvestigators } from "../actions/arkham-actions";
import Tracker from "./tracker";


export default async function Page() {
  const investigators = await getDBInvestigators();
  if (!Array.isArray(investigators)) {
    // Handle unexpected data structure
    return null;
  }
 
  const simpleInvestigators = investigators.map(inv => ({
    ...inv,
    faction_name: inv.faction_name ?? "",
  }));
  return <Tracker initialInvestigators={simpleInvestigators} />;
  
}
