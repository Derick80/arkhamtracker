import { auth } from "@/auth";
import { getDBInvestigators } from "./actions/arkham-actions";
import Tracker from "./arkham/tracker";

export default async function Home() {
  const session = await auth();
  const investigators = await getDBInvestigators();
  console.log(investigators, "<-- investigators in page.tsx");
  if(!investigators) return null
  return (
    <div className="flex flex-col w-full gap-4">
      <p className="text-lg">Welcome {session?.user?.name || "Guest"} </p>

      <Tracker initialInvestigators={investigators} />
    </div>
  );
}
