// src/components/expenses/FormElements/ParticipantSelect.jsx
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Local storage key for participants
const PARTICIPANTS_STORAGE_KEY = "expense_tracker_participants";

export function ParticipantSelect({ form }) {
  // Initialize with an empty array, will be populated from localStorage
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");
  
  // Load saved participants from localStorage on component mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
    if (savedParticipants) {
      try {
        const parsedParticipants = JSON.parse(savedParticipants);
        if (Array.isArray(parsedParticipants)) {
          setAvailableParticipants(parsedParticipants);
        }
      } catch (error) {
        console.error("Error parsing saved participants:", error);
        // If there's an error, start with default participants
        setAvailableParticipants(["Om", "Sanket", "Shantanu", "dravid", "neha", "rahul", "rajesh"]);
      }
    } else {
      // If no saved participants, use default list
      setAvailableParticipants(["Om", "Sanket", "Shantanu", "dravid", "neha", "rahul", "rajesh"]);
    }
  }, []);
  
  const selectedParticipants = form.watch("participants") || [];
  
  const toggleParticipant = (participant) => {
    const currentParticipants = [...selectedParticipants];
    const index = currentParticipants.indexOf(participant);
    
    if (index >= 0) {
      currentParticipants.splice(index, 1);
    } else {
      currentParticipants.push(participant);
    }
    
    form.setValue("participants", currentParticipants);
  };
  
  const addNewParticipant = () => {
    if (!newParticipant.trim()) return;
    
    // Add to available participants if not already there
    if (!availableParticipants.includes(newParticipant)) {
      const updatedParticipants = [...availableParticipants, newParticipant];
      setAvailableParticipants(updatedParticipants);
      
      // Save updated list to localStorage
      localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(updatedParticipants));
    }
    
    // Add to selected participants
    if (!selectedParticipants.includes(newParticipant)) {
      form.setValue("participants", [...selectedParticipants, newParticipant]);
    }
    
    setNewParticipant("");
  };
  
  return (
    <FormField
      control={form.control}
      name="participants"
      rules={{ required: "Select at least one participant" }}
      render={() => (
        <FormItem>
          <FormLabel>Participants</FormLabel>
          
          <div className="grid gap-4 pt-2">
            <div className="flex flex-wrap gap-3">
              {availableParticipants.map((participant) => (
                <div key={participant} className="flex items-center space-x-2 border rounded-md p-2">
                  <Checkbox
                    id={`participant-${participant}`}
                    checked={selectedParticipants.includes(participant)}
                    onCheckedChange={() => toggleParticipant(participant)}
                  />
                  <label
                    htmlFor={`participant-${participant}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {participant}
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
                className="flex-1"
              />
              <Button type="button" onClick={addNewParticipant} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}