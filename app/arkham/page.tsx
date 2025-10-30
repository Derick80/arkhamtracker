import { getDBInvestigators } from "../actions/arkham-actions";
import CreateCampaingn from "./create-campaign";
import Tracker from "./tracker";


export default async function Page() {
  const investigators = await getDBInvestigators();
  if (!Array.isArray(investigators)) {
    // Handle unexpected data structure
    return null;
  }
 
  return(
    <div className="space-y-6 py-6">
<CreateCampaingn investigators={investigators} />

      </div>
  )
}
