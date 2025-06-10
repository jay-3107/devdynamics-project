// src/components/expenses/FormElements/AmountInput.jsx
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AmountInput({ form }) {
  return (
    <FormField
      control={form.control}
      name="amount"
      rules={{
        required: "Amount is required",
        min: {
          value: 0.01,
          message: "Amount must be at least 0.01"
        }
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              step="any"
              placeholder="0.00"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}