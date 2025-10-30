import { getScenarioById } from "@/app/actions/arkham-actions";


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
  console.log("Scenario:", scenario);
  const investigators = scenario?.campaign.investigators || [];
  console.log("Investigators:", investigators);
  return (
    <div>
      <h1>Campaign ID: {cId}</h1>
      <h2>Scenario ID: {sId}</h2>
    </div>
  );
}
