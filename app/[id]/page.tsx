import { getGameById } from "../actions/arkham-actions";
import InvestigatorCardGrid from "../actions/selected-card";
import MythosTracker from "../actions/mythos-tracker";
import EnemiesTracker from "../actions/enemies-tracker";
import UpkeepTracker from "../actions/upkeep-tracker";
import ResetAllButton from "../actions/reset-all-button";

export default async function Page(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await props.params;
  if (!id) {
    throw new Error("id is required");
  }
const game = await getGameById(id);
if(!game)return null
console.log(game, "game")
  return (
    <article className=" relative z-10 mx-auto max-w-4xl space-y-4 overflow-auto px-2 py-4 align-middle md:px-0">
   
     <div className="grid gap-4">
       <div className="flex items-center justify-between">
         <h2 className="text-xl font-semibold">Phases</h2>
         <ResetAllButton gameId={id} />
       </div>
       <MythosTracker gameId={id} />
     </div>

     <InvestigatorCardGrid
     gameId={id}
     selected={
        game.investigators
     } />
        <div className="grid gap-4">
       <EnemiesTracker gameId={id} />
       <UpkeepTracker gameId={id} />
     </div>
      
    </article>
  );
}