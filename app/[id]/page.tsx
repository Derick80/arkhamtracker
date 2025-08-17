import { getAllInvestigators, getDBInvestigators, getGameById } from "../actions/arkham-actions";
import InvestigatorSelect from "../actions/select-investigator";
import InvestigatorCardGrid from "../actions/selected-card";
import SelectedInvestigators from "../actions/selected-card";

export default async function Page(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await props.params;
  if (!id) {
    throw new Error("id is required");
  }
const investigators = await getDBInvestigators();
const game = await getGameById(id);
if(!game)return null
console.log(game, "game")
  return (
    <article className=" relative z-10 mx-auto max-w-4xl space-y-4 overflow-auto px-2 py-4 align-middle md:px-0">
   

     <InvestigatorCardGrid
     gameId={id}
     selected={
        game.investigators
     } />

      
    </article>
  );
}