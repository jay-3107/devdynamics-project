// src/components/expenses/AddExpense.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddExpenseForm } from "./AddExpenseForm";

function AddExpense() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      console.log("Submitting expense data:", data);
      
      const response = await fetch("https://expense-splitter-api-n53l.onrender.com/expenses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Add expense response:", result);
      
      // Navigate back to expenses list on success
      navigate("/expenses");
    } catch (err) {
      console.error("Error adding expense:", err);
      setError(`Failed to add expense: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Expense</h1>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <AddExpenseForm 
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default AddExpense;