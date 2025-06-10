// src/components/expenses/FormElements/DescriptionInput.jsx
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function DescriptionInput({ form }) {
  return (
    <FormField
      control={form.control}
      name="description"
      rules={{ required: "Description is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="e.g., Dinner, Movie tickets, etc."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}