// src/components/people/PersonDetails.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Add this import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronLeft } from "lucide-react"; // Add this import

export function PersonDetails({ person, onBackToDirectory }) {
  const [personData, setPersonData] = useState({
    expenses: [],
    balances: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchPersonDetails = async () => {
      try {
        // Fetch expenses this person is involved in
        // This would need to be implemented in your backend
        const response = await fetch(`https://expense-splitter-api-n53l.onrender.com/expenses/?participant=${person.name}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch expenses: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Fetch balance info
          const balanceResponse = await fetch(`https://expense-splitter-api-n53l.onrender.com/balances`);
          const balanceData = await balanceResponse.json();
          
          // Find this person's balance
          const personBalance = balanceData.success && Array.isArray(balanceData.data) 
            ? balanceData.data.find(b => b.name === person.name)
            : null;
            
          setPersonData({
            expenses: data.data,
            balances: personBalance,
            loading: false,
            error: null
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching person details:", err);
        setPersonData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };
    
    fetchPersonDetails();
  }, [person.name]);
  
  if (personData.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (personData.error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load details: {personData.error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{person.name}</CardTitle>
                {personData.balances && (
                  <div className="text-lg">
                    Balance: <span className={parseFloat(personData.balances.balance) >= 0 
                      ? "text-green-600 font-medium" 
                      : "text-red-600 font-medium"
                    }>
                      {parseFloat(personData.balances.balance) >= 0 
                        ? `+$${personData.balances.balance}` 
                        : `-$${Math.abs(parseFloat(personData.balances.balance)).toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-muted-foreground text-sm">Expenses</div>
              <div className="text-xl font-medium">{person.count || 0}</div>
            </div>
            {personData.balances && (
              <>
                <div>
                  <div className="text-muted-foreground text-sm">Total Paid</div>
                  <div className="text-xl font-medium">${personData.balances.total_paid || "0.00"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Total Share</div>
                  <div className="text-xl font-medium">${personData.balances.total_share || "0.00"}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payments">Payments Made</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Split Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personData.expenses.map(expense => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.paid_by}</TableCell>
                  <TableCell className="text-right">${expense.amount}</TableCell>
                  <TableCell className="text-right capitalize">{expense.split_type}</TableCell>
                </TableRow>
              ))}
              
              {personData.expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No expenses found for this person.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="payments" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead>Split Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personData.expenses
                .filter(expense => expense.paid_by === person.name)
                .map(expense => (
                  <TableRow key={expense._id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">${expense.amount}</TableCell>
                    <TableCell className="text-right">
                      {expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="capitalize">{expense.split_type}</TableCell>
                  </TableRow>
              ))}
              
              {personData.expenses.filter(expense => expense.paid_by === person.name).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No payments made by this person.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}