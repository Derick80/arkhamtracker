import { getScenarioById } from "@/app/actions/arkham-actions";
import InteractiveTracker from "@/app/arkham/interactive-tracker";


export default async function Page(props: {
  params: Promise<{
    cId: string;
    sId: string;
  }>;
}) {
 const params = await props.params;
 const cId = params.cId;
 const sId = params.sId;
  const scenario = await getScenarioById(sId);
  if (!scenario) {
    return <div>Scenario not found</div>;
  }
  return (
    <div>
      <h1>Campaign ID: {cId}</h1>
      <h2>Scenario ID: {sId}</h2>
      <InteractiveTracker scenarioData={scenario} />
    </div>
  );
}
