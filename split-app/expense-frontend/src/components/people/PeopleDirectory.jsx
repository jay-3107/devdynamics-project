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
import { PlusCircle, Search, User, MoreVertical, Trash2, Edit } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Local storage key for locally added people
const LOCAL_PEOPLE_KEY = "expense_tracker_local_people";

export function PeopleDirectory({ people, selectedPerson, onPersonSelect, onPersonAdded, onPersonDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const { toast } = useToast();
  
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by most transactions first, then alphabetically for those with same count
  const sortedPeople = [...filteredPeople].sort((a, b) => {
    if (b.count === a.count) {
      return a.name.localeCompare(b.name);
    }
    return b.count - a.count;
  });
  
  // Check if a person is selected
  const isSelected = (person) => selectedPerson && selectedPerson.name === person.name;
  
  const handleDeletePerson = () => {
    if (!personToDelete) return;

    try {
      // Get current locally added people
      const localPeopleJson = localStorage.getItem(LOCAL_PEOPLE_KEY);
      let localPeople = localPeopleJson ? JSON.parse(localPeopleJson) : [];
      
      // Remove the person
      localPeople = localPeople.filter(p => p.name !== personToDelete.name);
      
      // Update localStorage
      localStorage.setItem(LOCAL_PEOPLE_KEY, JSON.stringify(localPeople));
      
      // Notify parent component - we'll need to add this to parent component
      if (onPersonDelete) {
        onPersonDelete(personToDelete);
      } else {
        // If there's no onPersonDelete function, reload the page to refresh the list
        window.location.reload();
      }
      
      toast({
        title: "Person deleted",
        description: `${personToDelete.name} has been removed.`,
      });
      
      // Clear the delete state
      setPersonToDelete(null);
      
      // If the deleted person was selected, clear selection
      if (selectedPerson && selectedPerson.name === personToDelete.name) {
        onPersonSelect(null);
      }
    } catch (error) {
      console.error("Error deleting person:", error);
      toast({
        title: "Error",
        description: "Failed to delete person. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Determine if a person can be deleted
  // Only locally added people can be deleted, and you can't delete people who are part of existing expenses
  const canDeletePerson = (person) => {
    return person.isLocal && (!person.count || person.count === 0);
  };

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
        Adding new people here will make them available when creating new expenses.
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedPeople.map(person => (
          <Card 
            key={person.name} 
            className={`overflow-hidden transition-colors ${
              isSelected(person) ? "border-primary bg-primary/5" : ""
            } ${person.isLocal ? "border-dashed" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {person.name}
                      {person.isLocal && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">New</span>
                      )}
                    </CardTitle>
                  </div>
                </div>
                
                {/* Add dropdown menu for actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onPersonSelect(person)}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    
                    {/* Disable Edit for now since we're not implementing it yet */}
                    <DropdownMenuItem 
                      disabled 
                      className="cursor-pointer text-muted-foreground"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Person
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => setPersonToDelete(person)}
                      disabled={!canDeletePerson(person)}
                      className={`cursor-pointer ${
                        canDeletePerson(person) ? "text-red-600 hover:text-red-700" : "text-muted-foreground"
                      }`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                      {!canDeletePerson(person) && person.count > 0 && (
                        <span className="ml-1">(In use)</span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Involved in:</span>
                  <span className="font-medium">{person.count || 0} expenses</span>
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
      
      <AddPersonDialog 
        open={showAddDialog} 
        setOpen={setShowAddDialog} 
        onPersonAdded={onPersonAdded}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!personToDelete} onOpenChange={(open) => !open && setPersonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Person</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {personToDelete?.name}?
              {personToDelete && personToDelete.count > 0 && (
                <div className="mt-2 font-semibold text-red-600">
                  This person is involved in {personToDelete.count} expenses and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePerson}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={personToDelete && !canDeletePerson(personToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}