'use client'

import { Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
 } from "@/components/ui/select"
import { addInvestigator, SimpleInvestigator } from "./arkham-actions"
import { useActionState, useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import React from "react"

type InvestigatorSelectProps ={
    gameId: string
    investigators:SimpleInvestigator[]
}

const InvestigatorSelect = ({investigators, gameId}:InvestigatorSelectProps)=>{
const [open, setOpen] = useState(false);


const [state, action, isPending]= useActionState(addInvestigator,null)
  if (!investigators.length) {
    return (
      <div className="rounded-xl border p-4">
        <p className="text-sm">All investigators are already added.</p>
      </div>
    );
  }
    return(
        <div className="rounded-2xl border">
      <div className=" flex items-center justify-between">
    
        <Button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className=" text-sm"
        >
          {open ? "x" : "Add another"}
        </Button>
      </div>

      {open && (
        <form 
        action={action}
        
        className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="gameId" value={gameId} />
        <Select
        name='investigatorCode'
        >
            <SelectTrigger>
                <SelectValue placeholder="Select an investigator" />
            </SelectTrigger>
            <SelectContent>
                {investigators.map((investigator) => (
                    <SelectItem key={investigator.code} value={investigator.code}>
                        {investigator.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Button
            type='submit'
            >
                {
                isPending ? 'Adding...' : 'Add Investigator'
                }
            </Button>
            </form>
      )}
      </div>
            
    )
}

export default InvestigatorSelect