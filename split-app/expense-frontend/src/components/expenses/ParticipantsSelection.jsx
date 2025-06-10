// src/components/expenses/ParticipantsSelection.jsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";

export function ParticipantsSelection({ form, people }) {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [showNewParticipantInput, setShowNewParticipantInput] = useState(false);
  const participants = form.watch("participants") || [];
  
  // Handle participant selection
  const handleParticipantToggle = (personName) => {
    const currentParticipants = form.getValues("participants") || [];
    const updatedParticipants = currentParticipants.includes(personName)
      ? currentParticipants.filter(p => p !== personName)
      : [...currentParticipants, personName];
    
    form.setValue("participants", updatedParticipants);
  };
  
  // Handle adding a new participant
  const handleAddNewParticipant = () => {
    if (newParticipantName.trim() === "") return;
    
    // Add to participants list
    const currentParticipants = form.getValues("participants") || [];
    if (!currentParticipants.includes(newParticipantName)) {
      form.setValue("participants", [...currentParticipants, newParticipantName]);
      
      // Reset the input and hide it
      setNewParticipantName("");
      setShowNewParticipantInput(false);
    }
  };

  return (
    <div>
      <FormLabel>Participants</FormLabel>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Existing people list */}
        {people.map((person) => {
          const personName = person.name;
          const isSelected = participants.includes(personName);
          return (
            <div
              key={person._id || person.id || person.name}
              className={`flex items-center p-2 rounded border ${
                isSelected ? "bg-primary/10 border-primary" : "border-input"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleParticipantToggle(personName)}
              />
              <span className="ml-2">{personName}</span>
            </div>
          );
        })}
        
        {/* Custom participants that were added previously */}
        {participants
          .filter(name => !people.some(p => p.name === name))
          .map(customName => (
            <div
              key={customName}
              className="flex items-center p-2 rounded border bg-primary/10 border-primary"
            >
              <Checkbox
                checked={true}
                onCheckedChange={() => handleParticipantToggle(customName)}
              />
              <span className="ml-2">{customName}</span>
            </div>
          ))
        }
      </div>
      
      {/* Add new participant section */}
      {showNewParticipantInput ? (
        <div className="flex mt-2 gap-2">
          <Input
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="Enter name"
            className="flex-1"
            autoFocus
          />
          <Button type="button" size="sm" onClick={handleAddNewParticipant}>
            Add
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={() => setShowNewParticipantInput(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setShowNewParticipantInput(true)}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add New Participant
        </Button>
      )}
      
      {form.formState.errors.participants && (
        <p className="text-sm font-medium text-destructive mt-2">
          {form.formState.errors.participants.message}
        </p>
      )}
    </div>
  );
}