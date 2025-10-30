'use client'
import React from "react";
import { createCampaign, SimpleInvestigator } from "@/app/actions/arkham-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue

 } from "@/components/ui/select";
const CreateCampaingn = ({
    investigators
}:{
    investigators:SimpleInvestigator[]
}) => {
    const [inv1, setInv1] = React.useState<string>("");
    const [inv2, setInv2] = React.useState<string>("none");
    const [inv3, setInv3] = React.useState<string>("none");
    const [inv4, setInv4] = React.useState<string>("none");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        await createCampaign(null, formData);
    };

    return(
        <div>
           {/* Create Campaign Form I want to create a name for the campaign and for the scenario and select investigators */}
           <form
              onSubmit={handleSubmit}   
           >
               <div>
                   <Label htmlFor="campaignName">Campaign Name:</Label>
                   <Input type="text" id="campaignName" name="campaignName" required />
               </div>
               <div>
                   <Label htmlFor="scenarioName">Scenario Name:</Label>
                   <Input type="text" id="scenarioName" name="scenarioName" required />
               </div>
               <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 1</label>
            <Select 
            name='investigator1'
            value={inv1} onValueChange={setInv1}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {investigators?.map((i) => (
                  <SelectItem key={i.code} value={i.code}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 2</label>
            <Select 
            name='investigator2'
            value={inv2} onValueChange={setInv2}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {investigators
                  ?.filter((i) => i.code !== inv1)
                  .map((i) => (
                    <SelectItem key={i.code} value={i.code}>
                      {i.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 3</label>
            <Select
              name='investigator3'
              value={inv3} onValueChange={setInv3}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {investigators
                  ?.filter((i) => i.code !== inv1 && i.code !== inv2 && i.code !== inv4)
                  .map((i) => (
                    <SelectItem key={i.code} value={i.code}>
                      {i.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-1">
            <label className="text-xs md:text-sm font-medium">Investigator 4</label>
            <Select
              name='investigator4'
              value={inv4} onValueChange={setInv4}>
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {investigators
                  ?.filter((i) => i.code !== inv1 && i.code !== inv2 && i.code !== inv3)
                  .map((i) => (
                    <SelectItem key={i.code} value={i.code}>
                      {i.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
               <Button type="submit">Create Campaign</Button>
           </form>
        </div>
    )
}

export default CreateCampaingn;