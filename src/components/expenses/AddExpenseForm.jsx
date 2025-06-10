// src/components/expenses/AddExpenseForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AmountInput } from "./FormElements/AmountInput";
import { DescriptionInput } from "./FormElements/DescriptionInput";
import { PaidBySelect } from "./FormElements/PaidBySelect";
import { SplitTypeSelect } from "./FormElements/SplitTypeSelect";
import { ParticipantSelect } from "./FormElements/ParticipantSelect";
import { CustomSplitInputs } from "./CustomSplitInputs";

export function AddExpenseForm({ onSubmit, submitting }) {
  const navigate = useNavigate();
  
  // Default form values
  const defaultValues = {
    amount: "",
    description: "",
    paid_by: "",
    split_type: "equal", // Default to equal split
    participants: [],
    custom_split: {}
  };
  
  const form = useForm({
    defaultValues
  });
  
  const splitType = form.watch("split_type");
  
  // Handle form submission
  const handleSubmit = (data) => {
    // If split type is equal, ensure custom_split is empty
    if (data.split_type === "equal") {
      data.custom_split = {};
    } else {
      // Validate custom split totals
      const customSplit = data.custom_split || {};
      const total = Object.values(customSplit).reduce((sum, val) => sum + Number(val || 0), 0);
      
      if (data.split_type === "percentage" && Math.abs(total - 100) > 0.01) {
        alert(`Split percentages must add up to 100%. Current total: ${total}%`);
        return;
      }
      
      if (data.split_type === "exact" && Math.abs(total - data.amount) > 0.01) {
        alert(`Split amounts must add up to ${data.amount}. Current total: ${total}`);
        return;
      }
    }
    
    // Make sure paid_by is included in participants
    if (data.paid_by && !data.participants.includes(data.paid_by)) {
      data.participants = [...data.participants, data.paid_by];
    }
    
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <DescriptionInput form={form} />
          <AmountInput form={form} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <PaidBySelect form={form} />
          <SplitTypeSelect form={form} />
        </div>
        
        <ParticipantSelect form={form} />
        
        {/* Only show custom split inputs for percentage or exact splits */}
        <CustomSplitInputs form={form} splitType={splitType} />
        
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/expenses")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}