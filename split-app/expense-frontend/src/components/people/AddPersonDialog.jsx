// src/components/people/AddPersonDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; // If you need to install toast, see below

// Local storage key for locally added people
const LOCAL_PEOPLE_KEY = "expense_tracker_local_people";

export function AddPersonDialog({ open, setOpen, onPersonAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast(); // If not using toast, you can remove this
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Get existing local people
      const localPeopleJson = localStorage.getItem(LOCAL_PEOPLE_KEY);
      const localPeople = localPeopleJson ? JSON.parse(localPeopleJson) : [];
      
      // Check if name already exists in local storage
      const nameExists = localPeople.some(p => 
        p.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (nameExists) {
        setError(`A person named "${name}" already exists`);
        setSubmitting(false);
        return;
      }
      
      // Create new person object
      const newPerson = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        isLocal: true, // Flag to identify locally added people
        count: 0 // No expenses yet
      };
      
      // Add to local storage
      localStorage.setItem(
        LOCAL_PEOPLE_KEY, 
        JSON.stringify([...localPeople, newPerson])
      );
      
      // Notify parent component
      if (onPersonAdded) {
        onPersonAdded(newPerson);
      }
      
      // Show success message if using toast
      if (toast) {
        toast({
          title: "Person added",
          description: `${name} has been added successfully.`,
        });
      }
      
      // Close dialog and reset form
      setOpen(false);
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      console.error("Error adding person:", err);
      setError("Failed to add person. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Add a new person to your expense tracker. They will appear in people selections when creating expenses.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input 
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}