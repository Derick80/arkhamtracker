import { auth } from "@/auth";
import NewGameForm from "./actions/new-game";
import { getArkhamGames } from "./actions/arkham-actions";
import Link from "next/link";

export default async function Home() {
  const session = await auth()
  console.log("Session:", session);
  const games = await getArkhamGames();
  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
     <main>
      <h1 className="text-3xl font-bold">Arkham Tracker</h1>
      <p className="text-lg">Welcome {session?.user?.name || "Guest"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.isArray(games) ? (
          games.map((game) => (
            <div key={game.id} className="flex flex-col border p-4 rounded">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <Link
                href={`/${game.id}`}
                prefetch
                className="text-blue-500 hover:underline ml-4">
                  View Game
                </Link>
              <p>Investigators: {game.investigators.length}</p>
            </div>
          ))
        ) : (
          <div className="text-red-500">
            {games.error ? `Error: ${games.error}` : "No games found."}
          </div>
        )}
      </div>
<NewGameForm />
     </main>
     
    </div>
  );
}
