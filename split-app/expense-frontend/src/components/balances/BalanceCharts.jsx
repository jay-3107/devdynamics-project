// src/components/balances/BalanceCharts.jsx
import React from "react";

export function BalanceCharts({ balances }) {
  // Sort balances by amount for better visualization
  const sortedBalances = [...balances].sort(
    (a, b) => parseFloat(b.balance) - parseFloat(a.balance)
  );
  
  // Calculate max balance value (positive or negative) for scaling
  const maxAbsBalance = Math.max(
    ...sortedBalances.map(p => Math.abs(parseFloat(p.balance)))
  );
  
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Balance Distribution</h2>
      
      <div className="space-y-4">
        {sortedBalances.map(person => {
          const balance = parseFloat(person.balance);
          const width = Math.min(100, Math.abs(balance) / maxAbsBalance * 100);
          
          return (
            <div key={person.name} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>{person.name}</span>
                <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                  {balance >= 0 ? `+$${balance}` : `-$${Math.abs(balance).toFixed(2)}`}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                {balance >= 0 ? (
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${width}%` }}
                  />
                ) : (
                  <div 
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: `${width}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
        
        {balances.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No balance data available
          </div>
        )}
      </div>
    </div>
  );
}