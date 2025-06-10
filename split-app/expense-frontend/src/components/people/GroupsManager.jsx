// src/components/people/GroupsManager.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Users, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function GroupsManager({ people }) {
  const [groups, setGroups] = useState([
    { 
      id: 1, 
      name: "Roommates", 
      members: ["Om", "Sanket", "Shantanu"],
      description: "Apartment expenses"
    },
    { 
      id: 2, 
      name: "Trip to Goa", 
      members: ["dravid", "neha", "rajesh", "rahul"],
      description: "Beach vacation expenses"
    },
  ]);
  
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: []
  });
  
  const toggleMember = (person) => {
    setNewGroup(prev => {
      const members = [...prev.members];
      const index = members.indexOf(person.name);
      
      if (index >= 0) {
        members.splice(index, 1);
      } else {
        members.push(person.name);
      }
      
      return { ...prev, members };
    });
  };
  
  const createGroup = () => {
    if (!newGroup.name.trim()) {
      return;
    }
    
    const newId = Math.max(0, ...groups.map(g => g.id)) + 1;
    
    setGroups([
      ...groups,
      {
        id: newId,
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        members: newGroup.members
      }
    ]);
    
    // Reset form
    setNewGroup({ name: "", description: "", members: [] });
    setShowNewGroup(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Expense Groups</h2>
        <Button onClick={() => setShowNewGroup(!showNewGroup)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      {showNewGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
            <CardDescription>
              Create a group to easily track expenses with specific people
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What's this group for?"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Select Members</Label>
              <div className="grid grid-cols-2 gap-3">
                {people.map(person => (
                  <div key={person.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`person-${person.name}`}
                      checked={newGroup.members.includes(person.name)}
                      onCheckedChange={() => toggleMember(person)}
                    />
                    <label
                      htmlFor={`person-${person.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {person.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowNewGroup(false)}>
              Cancel
            </Button>
            <Button onClick={createGroup} disabled={!newGroup.name.trim() || newGroup.members.length < 2}>
              Create Group
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {group.members.length} members
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {group.members.map(member => (
                  <div 
                    key={member} 
                    className="bg-muted px-2 py-1 rounded-md text-sm"
                  >
                    {member}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                New Expense for Group
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {groups.length === 0 && (
          <div className="col-span-full text-center p-12 bg-muted/50 rounded-lg text-muted-foreground">
            No groups created yet. Click "New Group" to get started.
          </div>
        )}
      </div>
    </div>
  );
}