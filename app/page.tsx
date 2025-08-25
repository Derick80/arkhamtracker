import { auth } from "@/auth";
import NewGameForm from "../components/arkham-tracker/new-game";
import { getArkhamGames } from "./actions/arkham-actions";
import Link from "next/link";
import ModeToggle from "@/components/mode-toggle";
import DeleteGameButton from "../components/arkham-tracker/delete-arkham-game";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await auth();
  console.log("Session:", session);
  const games = await getArkhamGames();
  return (
    <div className="flex flex-col w-full">
      <ModeToggle />
      <h1 className="text-3xl font-bold">Arkham Tracker</h1>
      <p className="text-lg">Welcome {session?.user?.name || "Guest"} </p>
      <Separator />
      <h2 className="text-2xl font-semibold">Your Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border w-full">
        {Array.isArray(games) ? (
          games.map((game) => (
            <Card key={game.id} className="relative">
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent>
                <p>Investigators: {game.investigators.length}</p>
                {game.investigators.length > 0 && (
                  <ul>
                    {game.investigators.map((investigator) => (
                      <li key={investigator.id}>{investigator.name}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <DeleteGameButton gameId={game.id} />
              <CardFooter>
                <Link
                  href={`/${game.id}`}
                  prefetch
                  className="text-blue-500 hover:underline ml-4"
                >
                  View Game
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-red-500">
            {games.error ? `Error: ${games.error}` : "No games found."}
          </div>
        )}
      </div>
      <h2 className="text-2xl font-semibold">Create New Game</h2>
      <Separator />

      <NewGameForm />
    </div>
  );
}
