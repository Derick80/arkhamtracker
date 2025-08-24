'use client'

import { useActionState } from "react";
import { createArkhamGame } from "./arkham-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const NewGameForm = () => {
const [state, action, isPending]= useActionState(createArkhamGame,null)

    return(
        <div 
       >
        <form 
        action={action}
         className="flex flex-col gap-4"
        >
            <Label htmlFor="Game Name">Game Name</Label>
            <Input 
            name='gameName'
            type="text"
            required
            placeholder="Enter a name for your game"
            />
            <Label htmlFor='scenario'>Scenario</Label>
            <Input 
            name='scenario'
            type="text"
            required
            placeholder="Enter the scenario name"
            />
            <Button 
            type='submit'
            disabled={isPending}
            >
                {
                    isPending ? 'Submitting' : 'Create Game' 
                }
            </Button>
        </form>
        </div>
    )

}


export default NewGameForm;