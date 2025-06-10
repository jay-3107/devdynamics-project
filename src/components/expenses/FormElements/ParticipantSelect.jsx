// src/components/expenses/FormElements/ParticipantSelect.jsx
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Local storage keys
const PARTICIPANTS_STORAGE_KEY = "expense_tracker_participants";
const LOCAL_PEOPLE_KEY = "expense_tracker_local_people";
const GROUPS_STORAGE_KEY = "expense_tracker_groups";

export function ParticipantSelect({ form }) {
  // Initialize with an empty array, will be populated from localStorage
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");
  
  // Load saved participants and groups from localStorage on component mount
  useEffect(() => {
    // Get regular participants
    const savedParticipants = localStorage.getItem(PARTICIPANTS_STORAGE_KEY) || "[]";
    
    // Get locally added people
    const localPeople = localStorage.getItem(LOCAL_PEOPLE_KEY) || "[]";
    
    // Get groups
    const savedGroups = localStorage.getItem(GROUPS_STORAGE_KEY) || "[]";
    
    try {
      const parsedParticipants = JSON.parse(savedParticipants);
      const parsedLocalPeople = JSON.parse(localPeople);
      const parsedGroups = JSON.parse(savedGroups);
      
      // Combine both sources, ensuring uniqueness
      const participantNames = new Set(
        Array.isArray(parsedParticipants) ? parsedParticipants : []
      );
      
      // Add local people's names
      if (Array.isArray(parsedLocalPeople)) {
        parsedLocalPeople.forEach(person => {
          participantNames.add(person.name);
        });
      }
      
      setAvailableParticipants([...participantNames].sort());
      setGroups(parsedGroups);
    } catch (error) {
      console.error("Error parsing saved participants:", error);
      // If there's an error, start with default participants
      setAvailableParticipants(["Om", "Sanket", "Shantanu", "dravid", "neha", "rahul", "rajesh"]);
      setGroups([]);
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
      
      // Also add to locally added people for future reference
      try {
        const localPeopleJson = localStorage.getItem(LOCAL_PEOPLE_KEY);
        const localPeople = localPeopleJson ? JSON.parse(localPeopleJson) : [];
        
        // Check if this person already exists in local people
        if (!localPeople.some(p => p.name === newParticipant)) {
          localPeople.push({
            name: newParticipant,
            isLocal: true,
            count: 0
          });
          localStorage.setItem(LOCAL_PEOPLE_KEY, JSON.stringify(localPeople));
        }
      } catch (e) {
        console.error("Error updating local people:", e);
      }
    }
    
    // Add to selected participants
    if (!selectedParticipants.includes(newParticipant)) {
      form.setValue("participants", [...selectedParticipants, newParticipant]);
    }
    
    setNewParticipant("");
  };
  
  const selectGroup = (groupId) => {
    const group = groups.find(g => g.id === parseInt(groupId));
    if (!group) return;
    
    // Combine current participants with group members, removing duplicates
    const combinedParticipants = [...new Set([...selectedParticipants, ...group.members])];
    form.setValue("participants", combinedParticipants);
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
            {groups.length > 0 && (
              <div className="mb-4">
                <Select onValueChange={selectGroup}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add from saved groups" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{group.name} ({group.members.length} people)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Accordion type="single" collapsible className="w-full" defaultValue="participants">
              <AccordionItem value="participants">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <span>Select Participants</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                      {selectedParticipants.length} selected
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-3 mt-2">
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
                    
                    {availableParticipants.length === 0 && (
                      <div className="w-full text-center p-4 text-muted-foreground">
                        No saved participants. Add some below.
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
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
            
            {/* Show selected participants */}
            {selectedParticipants.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map(participant => (
                    <div 
                      key={participant}
                      className="bg-primary/10 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {participant}
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleParticipant(participant)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}