// src/components/expenses/EditExpense.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EditExpenseForm } from "./EditExpenseForm";

// Form schema
const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paid_by: z.string().min(1, "Payer is required"),
  split_type: z.enum(["equal", "percentage", "exact"]),
  participants: z.array(z.string()).min(1, "At least one participant is required"),
  custom_split: z.record(z.number()).optional(),
});

export default function EditExpense() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const expenseData = location.state?.expense;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [people, setPeople] = useState([]);

  // Setup form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      paid_by: "",
      split_type: "equal",
      participants: [],
      custom_split: {},
    },
  });

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Fetch people for dropdown
        try {
          const peopleResponse = await fetch("https://expense-splitter-api-n53l.onrender.com/people/");
          const peopleData = await peopleResponse.json();
          
          if (peopleData && peopleData.data && Array.isArray(peopleData.data)) {
            setPeople(peopleData.data);
          } else if (Array.isArray(peopleData)) {
            setPeople(peopleData);
          } else {
            setPeople([]);
          }
        } catch (peopleError) {
          console.error("Error fetching people:", peopleError);
          setPeople([]);
        }

        // If we have expense data from navigation state, use it
        if (expenseData) {
          // Initialize the form with expense data
          form.reset({
            description: expenseData.description || "",
            amount: expenseData.amount || "",
            paid_by: expenseData.paid_by || "",
            split_type: expenseData.split_type || "equal",
            participants: expenseData.participants || [],
            custom_split: expenseData.custom_split || {},
          });
        } else {
          console.error("No expense data available");
          setError("No expense data available for editing");
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [expenseData, form]);

  // Submit handler
 const onSubmit = async (data) => {
  setSubmitting(true);
  try {
    const finalExpenseId = expenseId || (expenseData && expenseData._id);
    
    if (!finalExpenseId) {
      throw new Error("No expense ID available");
    }
    
    // Send the data as is - your API expects the right format already
    console.log("Submitting expense data:", data);
    
    const response = await fetch(`https://expense-splitter-api-n53l.onrender.com/expenses/${finalExpenseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    navigate("/expenses");
  } catch (err) {
    console.error("Error updating expense:", err);
    setError(`Failed to update expense: ${err.message}`);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        <p>{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/expenses")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Expense</h1>
      <EditExpenseForm 
        form={form}
        people={people}
        submitting={submitting} 
        onSubmit={onSubmit}
      />
    </div>
  );
}