// src/components/expenses/EditExpenseForm.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CustomPayerField } from "./CustomPayerField";
import { ParticipantsSelection } from "./ParticipantsSelection";
import { CustomSplitInputs } from "./CustomSplitInputs";

export function EditExpenseForm({ form, people, submitting, onSubmit }) {
  const navigate = useNavigate();
  const splitType = form.watch("split_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What was this expense for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paid_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid By</FormLabel>
              <FormControl>
                <CustomPayerField form={form} field={field} people={people} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="split_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Split Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="exact">Exact</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ParticipantsSelection form={form} people={people} />
        
        <CustomSplitInputs form={form} splitType={splitType} />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/expenses")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}