'use client'
import { Button } from "@/components/ui/button"
import { deleteArkhamGame } from "./arkham-actions";
import { useActionState } from "react";
import { XIcon } from "lucide-react";



const DeleteGameButton = (
    { gameId }:{
        gameId:string,
    }
)=>{
const [state, action, isPending]= useActionState(deleteArkhamGame,null)

    return(
        <form action={action} className="absolute right-0 top-0 z-10">
  <input type="hidden" name="gameId" value={gameId} />

  <Button
    type="submit"
    variant="destructive"
    size='icon'
    
    aria-label={`Remove this investigator  from game`}
    title="Remove from game"
    disabled={isPending}
  >
    <span className="text-lg leading-none" aria-hidden>
    <XIcon />
    </span>
  </Button>
</form>

    )
}

export default DeleteGameButton;