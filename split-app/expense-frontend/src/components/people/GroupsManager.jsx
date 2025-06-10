// src/components/people/GroupsManager.jsx
import React, { useState, useEffect } from "react";
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
import { PlusCircle, Users, Pencil, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Local storage keys
const GROUPS_STORAGE_KEY = "expense_tracker_groups";

export function GroupsManager({ people }) {
  const [groups, setGroups] = useState([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [deleteGroupId, setDeleteGroupId] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: []
  });
  const { toast } = useToast();
  
  // Load groups from localStorage
  useEffect(() => {
    const loadGroups = () => {
      try {
        const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
        if (storedGroups) {
          setGroups(JSON.parse(storedGroups));
        }
      } catch (err) {
        console.error("Error loading groups:", err);
        toast({
          title: "Error",
          description: "Failed to load groups.",
          variant: "destructive",
        });
      }
    };
    
    loadGroups();
  }, [toast]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!showNewGroup && !editGroupId) {
      setNewGroup({
        name: "",
        description: "",
        members: []
      });
    }
  }, [showNewGroup, editGroupId]);
  
  // Load group data when editing
  useEffect(() => {
    if (editGroupId !== null) {
      const groupToEdit = groups.find(g => g.id === editGroupId);
      if (groupToEdit) {
        setNewGroup({
          name: groupToEdit.name,
          description: groupToEdit.description || "",
          members: [...groupToEdit.members]
        });
      }
    }
  }, [editGroupId, groups]);
  
  const saveGroups = (updatedGroups) => {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    } catch (err) {
      console.error("Error saving groups:", err);
      toast({
        title: "Error",
        description: "Failed to save groups.",
        variant: "destructive",
      });
    }
  };
  
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
    if (!newGroup.name.trim() || newGroup.members.length < 2) {
      toast({
        title: "Validation Error",
        description: "Group name is required and at least 2 members must be selected.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate group names
    if (groups.some(g => g.name.toLowerCase() === newGroup.name.toLowerCase() && g.id !== editGroupId)) {
      toast({
        title: "Duplicate Name",
        description: `A group named "${newGroup.name}" already exists.`,
        variant: "destructive",
      });
      return;
    }
    
    let updatedGroups;
    
    if (editGroupId !== null) {
      // Update existing group
      updatedGroups = groups.map(group => 
        group.id === editGroupId 
          ? { 
              ...group, 
              name: newGroup.name.trim(),
              description: newGroup.description.trim(),
              members: newGroup.members,
              updatedAt: new Date().toISOString()
            }
          : group
      );
      
      toast({
        title: "Group updated",
        description: `"${newGroup.name}" has been updated successfully.`,
      });
      
      setEditGroupId(null);
    } else {
      // Create new group
      const newId = Math.max(0, ...groups.map(g => g.id)) + 1;
      
      updatedGroups = [
        ...groups,
        {
          id: newId,
          name: newGroup.name.trim(),
          description: newGroup.description.trim(),
          members: newGroup.members,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      toast({
        title: "Group created",
        description: `"${newGroup.name}" has been created successfully.`,
      });
    }
    
    saveGroups(updatedGroups);
    setShowNewGroup(false);
  };
  
  const deleteGroup = () => {
    if (deleteGroupId === null) return;
    
    const groupToDelete = groups.find(g => g.id === deleteGroupId);
    if (!groupToDelete) return;
    
    const updatedGroups = groups.filter(group => group.id !== deleteGroupId);
    saveGroups(updatedGroups);
    
    toast({
      title: "Group deleted",
      description: `"${groupToDelete.name}" has been deleted.`,
    });
    
    setDeleteGroupId(null);
  };
  
  const openEditDialog = (groupId) => {
    setEditGroupId(groupId);
    setShowNewGroup(true);
  };
  
  const closeDialog = () => {
    setShowNewGroup(false);
    setEditGroupId(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Expense Groups</h2>
        <Button onClick={() => setShowNewGroup(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      {/* Help text for new users */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
        Create groups to easily split expenses with the same people repeatedly.
        Each group needs at least 2 members.
      </div>
      
      {/* Groups grid display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openEditDialog(group.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setDeleteGroupId(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
                  <Badge 
                    key={member} 
                    variant="secondary"
                    className="px-2 py-1"
                  >
                    {member}
                  </Badge>
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
      
      {/* Create/Edit Group Dialog */}
      <Dialog open={showNewGroup} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editGroupId !== null ? 'Edit Group' : 'Create New Group'}</DialogTitle>
            <DialogDescription>
              {editGroupId !== null 
                ? 'Modify your expense group details and members.' 
                : 'Create a group to easily track expenses with specific people.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
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
              <div className="flex justify-between items-center">
                <Label>Select Members</Label>
                <span className="text-xs text-muted-foreground">
                  {newGroup.members.length} selected ({newGroup.members.length < 2 ? 'Min 2 required' : 'OK'})
                </span>
              </div>
              
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {people.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No people available to add to this group.
                  </div>
                ) : (
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
                )}
              </div>
              
              {newGroup.members.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newGroup.members.map(member => (
                    <Badge 
                      key={member}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {member}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setNewGroup(prev => ({
                            ...prev,
                            members: prev.members.filter(m => m !== member)
                          }));
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={createGroup} 
              disabled={!newGroup.name.trim() || newGroup.members.length < 2}
            >
              {editGroupId !== null ? 'Save Changes' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteGroupId !== null} onOpenChange={(open) => !open && setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}