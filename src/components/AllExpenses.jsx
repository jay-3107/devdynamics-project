// src/components/AllExpenses.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Plus, Edit, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AllExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch function that correctly extracts the data array
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://expense-splitter-api-n53l.onrender.com/expenses/");
                const responseData = await response.json();
                console.log("API Response:", responseData);

                // Extract the data array from the response object
                if (responseData && responseData.data && Array.isArray(responseData.data)) {
                    setExpenses(responseData.data);
                } else {
                    console.error("Unexpected API response format:", responseData);
                    setExpenses([]);
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching expenses:", err);
                setError("Failed to load expenses. Please try again later.");
                setExpenses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                const response = await fetch(`https://expense-splitter-api-n53l.onrender.com/expenses/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    // Remove the deleted expense from the state
                    setExpenses(expenses.filter(expense => expense._id !== id));
                } else {
                    alert("Failed to delete the expense");
                }
            } catch (error) {
                console.error("Error deleting expense:", error);
                alert("An error occurred while trying to delete the expense");
            }
        }
    };

    // Navigate to edit expense page
    const handleEdit = (expense) => {
        // Make sure we have the _id available
        if (!expense || !expense._id) {
            console.error("Missing expense ID for editing", expense);
            return;
        }

        // Navigate to the edit page with the expense data
        navigate(`/expenses/edit/${expense._id}`, {
            state: { expense }
        });
    };

    // Format participants list for display
    const formatParticipants = (participants) => {
        if (!participants || participants.length === 0) {
            return "None";
        }
        
        // If there are more than 2 participants, show first 2 and "+X more"
        if (participants.length > 2) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center">
                            <span>{participants[0]}, {participants[1]}</span>
                            <span className="ml-1 text-sm text-muted-foreground bg-muted px-1.5 rounded-full">
                                +{participants.length - 2}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{participants.join(", ")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        
        // Show all participants if 2 or fewer
        return participants.join(", ");
    };

    // Show loading state
    if (loading) {
        return <div className="p-4">Loading expenses...</div>;
    }

    // Show error state
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">All Expenses</h1>
                <Button
                    className="flex items-center gap-2"
                    onClick={() => navigate("/expenses/add")}
                >
                    <Plus className="h-4 w-4" /> Add Expense
                </Button>
            </div>

            {expenses.length === 0 ? (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                    No expenses found. Click "Add Expense" to create one.
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid By</TableHead>
                                <TableHead>Split Type</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense._id}>
                                    <TableCell>{expense.description || "No description"}</TableCell>
                                    <TableCell>${parseFloat(expense.amount || 0).toFixed(2)}</TableCell>
                                    <TableCell>{expense.paid_by || "Unknown"}</TableCell>
                                    <TableCell>
                                        {expense.split_type
                                            ? expense.split_type.charAt(0).toUpperCase() + expense.split_type.slice(1)
                                            : "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {formatParticipants(expense.participants)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(expense)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(expense._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

export default AllExpenses;