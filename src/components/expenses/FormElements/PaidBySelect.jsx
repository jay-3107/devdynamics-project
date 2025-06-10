// src/components/expenses/FormElements/PaidBySelect.jsx
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PaidBySelect({ form }) {
  const participants = form.watch("participants") || [];
  
  return (
    <FormField
      control={form.control}
      name="paid_by"
      rules={{ required: "Paid by is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Paid By</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <SelectItem key={participant} value={participant}>
                      {participant}
                    </SelectItem>
                  ))
                ) : (
                  // Fix: Use a non-empty value for this SelectItem
                  <SelectItem value="__placeholder" disabled>
                    Add participants first
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}