// src/components/expenses/FormElements/SplitTypeSelect.jsx
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SplitTypeSelect({ form }) {
  return (
    <FormField
      control={form.control}
      name="split_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Split Type</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="exact">Exact</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}