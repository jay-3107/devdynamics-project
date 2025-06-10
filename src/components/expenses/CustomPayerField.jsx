// src/components/expenses/CustomPayerField.jsx
import React, { useState } from "react";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CustomPayerField({ form, field, people }) {
  const [newPayerName, setNewPayerName] = useState("");
  const [isAddingNewPayer, setIsAddingNewPayer] = useState(false);
  
  const handleAddNewPayer = () => {
    if (newPayerName.trim() === "") return;
    form.setValue("paid_by", newPayerName);
    setNewPayerName("");
    setIsAddingNewPayer(false);
  };

  // Fix 1: When adding a new payer, disable the select completely
  const currentValue = field.value;
  const isCustomValue = currentValue && !people.some(p => p.name === currentValue);

  return (
    <div className="relative">
      <div className="flex gap-2">
        {isAddingNewPayer ? (
          <div className="flex-1">
            <Input
              placeholder="Enter new payer name"
              value={newPayerName}
              onChange={e => setNewPayerName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        ) : (
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {people.map((person) => (
                <SelectItem key={person._id || person.id || person.name} value={person.name}>
                  {person.name}
                </SelectItem>
              ))}
              {isCustomValue && (
                <SelectItem value={currentValue}>{currentValue} (Custom)</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}

        {isAddingNewPayer ? (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={handleAddNewPayer}
              disabled={!newPayerName.trim()}
            >
              Add
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNewPayer(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="icon" 
            type="button"
            onClick={() => setIsAddingNewPayer(true)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}