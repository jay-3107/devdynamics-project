// src/components/expenses/ParticipantsSelection.jsx
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export function ParticipantsSelection({ form, people = [] }) {
  const [newParticipant, setNewParticipant] = React.useState("");
  const participants = form.watch("participants") || [];
  const paidBy = form.watch("paid_by");

  // Ensure payer always stays in participants list
  useEffect(() => {
    if (paidBy && !participants.includes(paidBy)) {
      form.setValue("participants", [...participants, paidBy]);
    }
  }, [paidBy, participants, form]);

  const toggleParticipant = (name) => {
    const updatedParticipants = [...participants];
    const index = updatedParticipants.indexOf(name);
    
    // If the person being toggled is the payer, don't allow removal
    if (name === paidBy && index >= 0) {
      return;
    }
    
    if (index >= 0) {
      updatedParticipants.splice(index, 1);
    } else {
      updatedParticipants.push(name);
    }
    
    form.setValue("participants", updatedParticipants);
  };
  
  const addNewParticipant = () => {
    if (!newParticipant.trim()) return;
    if (participants.includes(newParticipant)) return;
    
    form.setValue("participants", [...participants, newParticipant]);
    setNewParticipant("");
  };

  // Combine people from props and existing participants to show all options
  const allPeople = [...new Set([
    ...participants,
    ...people.map(person => person.name)
  ])].sort();

  return (
    <FormField
      control={form.control}
      name="participants"
      render={() => (
        <FormItem className="space-y-4">
          <FormLabel>Participants</FormLabel>
          
          <div className="flex flex-wrap gap-2">
            {allPeople.map((person) => (
              <div 
                key={person}
                className={`flex items-center space-x-2 border rounded-md p-2 ${
                  person === paidBy ? "border-primary" : ""
                }`}
              >
                <Checkbox
                  checked={participants.includes(person)}
                  onCheckedChange={() => toggleParticipant(person)}
                  disabled={person === paidBy} // Disable checkbox for the payer
                />
                <label className="text-sm font-medium leading-none cursor-pointer">
                  {person}
                  {person === paidBy && (
                    <span className="ml-1 text-xs text-muted-foreground">(paid)</span>
                  )}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add New Participant"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewParticipant())}
            />
            <Button type="button" onClick={addNewParticipant} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Show selected participants */}
          {participants.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Selected:</div>
              <div className="flex flex-wrap gap-2">
                {participants.map(participant => (
                  <div 
                    key={participant}
                    className={`bg-primary/10 px-2 py-1 rounded-md text-sm flex items-center gap-1 ${
                      participant === paidBy ? "border border-primary" : ""
                    }`}
                  >
                    {participant}
                    {participant !== paidBy && (
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleParticipant(participant)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}