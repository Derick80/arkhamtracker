'use client'

import { useActionState } from "react";
import { createArkhamGame } from "./arkham-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const NewGameForm = () => {
const [state, action, isPending]= useActionState(createArkhamGame,null)

    return(
        <form 
        action={action}
        >
            <Label htmlFor="Game Name">Game Name</Label>
            <Input 
            name='gameName'
            type="text"
            />
            <Button 
            type='submit'
            disabled={isPending}
            >
                {
                    isPending ? 'Submitting' : 'submit' 
                }
            </Button>
        </form>
    )

}


export default NewGameForm;