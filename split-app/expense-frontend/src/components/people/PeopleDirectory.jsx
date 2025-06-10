// src/components/people/PeopleDirectory.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Search, User } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";

export function PeopleDirectory({ people, selectedPerson, onPersonSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by most transactions first
  const sortedPeople = [...filteredPeople].sort((a, b) => b.count - a.count);
  
  // Check if a person is selected
  const isSelected = (person) => selectedPerson && selectedPerson.name === person.name;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>
      
      {/* Help text for new users */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
        Click <strong>View Details</strong> on any person card to see their expense history and balance details.
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedPeople.map(person => (
          <Card 
            key={person.name} 
            className={`overflow-hidden transition-colors ${
              isSelected(person) ? "border-primary bg-primary/5" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{person.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Involved in:</span>
                  <span className="font-medium">{person.count} expenses</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant={isSelected(person) ? "default" : "outline"}
                size="sm"
                onClick={() => onPersonSelect(person)}
                className="w-full"
              >
                <User className="mr-2 h-3 w-3" />
                {isSelected(person) ? "Currently Viewing" : "View Details"}
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredPeople.length === 0 && (
          <div className="col-span-full text-center p-12 bg-muted/50 rounded-lg">
            {searchTerm 
              ? `No people matching "${searchTerm}" found` 
              : "No people added yet. Click 'Add Person' to get started."}
          </div>
        )}
      </div>
      
      <AddPersonDialog open={showAddDialog} setOpen={setShowAddDialog} />
    </div>
  );
}