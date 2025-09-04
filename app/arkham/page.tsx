import { getDBInvestigators } from "../actions/arkham-actions";
import Tracker from "./tracker";


export default async function Page() {
  const investigators = await getDBInvestigators();
  if (!Array.isArray(investigators)) {
    // Handle unexpected data structure
    return null;
  }
 
  return <Tracker initialInvestigators={investigators} />;
  
}
