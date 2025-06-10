// src/components/expenses/CustomSplitInputs.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CustomSplitInputs({ form, splitType }) {
  // Store all values as strings exactly as entered
  const [inputValues, setInputValues] = useState({});
  const participants = form.watch("participants") || [];
  const amount = form.getValues("amount") || 0;
  
  // Track validation errors
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (splitType !== "equal" && participants.length > 0) {
      const customSplit = form.getValues("custom_split") || {};
      const newValues = { ...customSplit };
      const newInputValues = { ...inputValues };
      let needsUpdate = false;
      
      // Clear values for non-participants
      Object.keys(newValues).forEach(key => {
        if (!participants.includes(key)) {
          delete newValues[key];
          delete newInputValues[key];
          needsUpdate = true;
        }
      });
      
      // Initialize values for new participants
      participants.forEach(participant => {
        if (newValues[participant] === undefined) {
          if (splitType === "percentage") {
            // For percentage, distribute evenly
            const value = Math.floor(100 / participants.length);
            newValues[participant] = value;
            newInputValues[participant] = String(value);
          } else { // exact split
            // For exact amounts, divide evenly
            const value = amount / participants.length;
            newValues[participant] = value;
            newInputValues[participant] = String(value);
          }
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        // Adjust values to ensure they sum correctly
        if (splitType === "percentage") {
          const total = Object.values(newValues).reduce((sum, val) => sum + Number(val || 0), 0);
          if (total !== 100 && participants.length > 0) {
            // Find the first participant to adjust
            const firstParticipant = participants[0];
            const currentValue = Number(newValues[firstParticipant] || 0);
            const adjustment = 100 - total;
            newValues[firstParticipant] = Math.max(0, currentValue + adjustment);
            newInputValues[firstParticipant] = String(newValues[firstParticipant]);
          }
        }
        
        form.setValue("custom_split", newValues);
        setInputValues(newInputValues);
      }
    } else {
      // Reset values if type switches to equal or no participants
      setInputValues({});
      form.setValue("custom_split", {});
    }
  }, [splitType, participants, amount]);
  
  if (splitType === "equal" || participants.length === 0) {
    return null;
  }
  
  // Handle direct input without any conversion
  const handleInputChange = (participant, e) => {
    const rawValue = e.target.value;
    
    // Store the raw input value directly
    setInputValues({
      ...inputValues,
      [participant]: rawValue
    });
    
    // Use a simple number conversion for the form value
    const numValue = rawValue === '' ? 0 : Number(rawValue);
    
    const newCustomSplit = {
      ...form.getValues("custom_split"),
      [participant]: numValue
    };
    
    form.setValue("custom_split", newCustomSplit);
    
    // Validate total
    validateTotals(newCustomSplit);
  };
  
  // Validate totals and set error state
  const validateTotals = (customSplit) => {
    const total = Object.values(customSplit).reduce((sum, val) => sum + Number(val || 0), 0);
    
    if (splitType === "exact" && Math.abs(total - amount) > 0.01) {
      setError(`Total must equal ${amount}, current total is ${total}`);
    } else if (splitType === "percentage" && Math.abs(total - 100) > 0.01) {
      setError(`Total percentage must equal 100%, current total is ${total}%`);
    } else {
      setError(null);
    }
  };
  
  // Calculate totals for display
  const calculateTotal = () => {
    const customSplit = form.getValues("custom_split") || {};
    return Object.values(customSplit).reduce((sum, val) => sum + Number(val || 0), 0);
  };
  
  // Auto-adjust values to ensure they sum correctly
  const adjustValues = () => {
    const customSplit = form.getValues("custom_split") || {};
    const newValues = { ...customSplit };
    const newInputValues = { ...inputValues };
    
    if (splitType === "percentage") {
      const total = calculateTotal();
      if (Math.abs(total - 100) > 0.01) {
        // Calculate equal distribution
        const equalShare = Math.floor(100 / participants.length);
        let remaining = 100;
        
        participants.forEach((participant, index) => {
          if (index === participants.length - 1) {
            // Last participant gets the remainder
            newValues[participant] = remaining;
          } else {
            newValues[participant] = equalShare;
            remaining -= equalShare;
          }
          newInputValues[participant] = String(newValues[participant]);
        });
        
        form.setValue("custom_split", newValues);
        setInputValues(newInputValues);
        setError(null);
      }
    } else if (splitType === "exact") {
      const total = calculateTotal();
      if (Math.abs(total - amount) > 0.01) {
        // Calculate equal distribution
        const equalShare = Math.floor(amount * 100 / participants.length) / 100;
        let remaining = amount;
        
        participants.forEach((participant, index) => {
          if (index === participants.length - 1) {
            // Last participant gets the remainder, rounded to 2 decimal places
            newValues[participant] = Math.round(remaining * 100) / 100;
          } else {
            newValues[participant] = equalShare;
            remaining -= equalShare;
          }
          newInputValues[participant] = String(newValues[participant]);
        });
        
        form.setValue("custom_split", newValues);
        setInputValues(newInputValues);
        setError(null);
      }
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          {splitType === "percentage" ? "Percentage Split" : "Exact Amounts"}
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={adjustValues}
        >
          Distribute Evenly
        </Button>
      </div>
      
      {participants.map((participant) => (
        <div key={participant} className="flex items-center gap-2">
          <span className="w-1/3">{participant}</span>
          <input
            type="text" // Use text input to preserve exactly what user types
            value={inputValues[participant] || ''} 
            onChange={(e) => handleInputChange(participant, e)}
            className={`w-2/3 h-10 px-3 py-2 rounded-md border ${
              error ? "border-red-500" : "border-input"
            } bg-background`}
          />
        </div>
      ))}
      
      {error ? (
        <div className="text-sm text-red-500 font-medium">
          {error}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {splitType === "percentage" ? (
            <>Total: {calculateTotal()}% (should equal 100%)</>
          ) : (
            <>Total: ${calculateTotal()} (should equal ${amount})</>
          )}
        </div>
      )}
    </div>
  );
}