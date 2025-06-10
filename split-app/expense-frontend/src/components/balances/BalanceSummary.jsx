// src/components/balances/BalanceSummary.jsx
import React, { useMemo } from "react";

export function BalanceSummary({ balances }) {
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!balances || balances.length === 0) {
      return {
        totalPaid: "0.00",
        highestOwed: { name: "N/A", amount: "0.00" },
        highestOwes: { name: "N/A", amount: "0.00" },
        peopleCount: 0
      };
    }
    
    const totalPaid = balances.reduce(
      (sum, person) => sum + parseFloat(person.total_paid), 
      0
    ).toFixed(2);
    
    let highestOwed = { name: "", amount: -Infinity };
    let highestOwes = { name: "", amount: Infinity };
    
    balances.forEach(person => {
      const balance = parseFloat(person.balance);
      
      if (balance > highestOwed.amount) {
        highestOwed = { name: person.name, amount: balance.toFixed(2) };
      }
      
      if (balance < highestOwes.amount) {
        highestOwes = { name: person.name, amount: balance.toFixed(2) };
      }
    });
    
    return {
      totalPaid,
      highestOwed,
      highestOwes,
      peopleCount: balances.length
    };
  }, [balances]);
  
  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Expenses</div>
          <div className="text-2xl font-bold">${stats.totalPaid}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Among {stats.peopleCount} people
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Highest Balance</div>
          <div className="text-2xl font-bold text-green-600">
            ${stats.highestOwed.amount}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.highestOwed.name}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Owes the Most</div>
          <div className="text-2xl font-bold text-red-600">
            ${Math.abs(parseFloat(stats.highestOwes.amount)).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.highestOwes.name}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Average Share</div>
          <div className="text-2xl font-bold">
            ${(parseFloat(stats.totalPaid) / Math.max(1, stats.peopleCount)).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Per person
          </div>
        </div>
      </div>
    </div>
  );
}