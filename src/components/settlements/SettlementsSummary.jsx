// src/components/settlements/SettlementsSummary.jsx
import React, { useMemo } from "react";
import { CircleDollarSign, ArrowLeftRight, Users, Check } from "lucide-react";

export function SettlementsSummary({ settlements }) {
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!settlements || settlements.length === 0) {
      return {
        totalAmount: "0.00",
        uniquePeople: new Set(),
        maxTransaction: { from: "N/A", to: "N/A", amount: "0.00" }
      };
    }
    
    const uniquePeople = new Set();
    let totalAmount = 0;
    let maxTransaction = { amount: 0 };
    
    settlements.forEach(transaction => {
      uniquePeople.add(transaction.from_person);
      uniquePeople.add(transaction.to_person);
      
      const amount = parseFloat(transaction.amount);
      totalAmount += amount;
      
      if (amount > maxTransaction.amount) {
        maxTransaction = {
          from: transaction.from_person,
          to: transaction.to_person,
          amount: amount.toFixed(2)
        };
      }
    });
    
    return {
      totalAmount: totalAmount.toFixed(2),
      uniquePeople,
      peopleCount: uniquePeople.size,
      maxTransaction,
      transactionCount: settlements.length
    };
  }, [settlements]);
  
  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Settlement Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground">Total to Settle</div>
              <div className="text-2xl font-bold">${stats.totalAmount}</div>
            </div>
            <CircleDollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Across {stats.transactionCount} transactions
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground">People Involved</div>
              <div className="text-2xl font-bold">{stats.peopleCount}</div>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            In settlement plan
          </div>
        </div>
        
        <div className="col-span-2 bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground">Largest Settlement</div>
              <div className="text-2xl font-bold">${stats.maxTransaction.amount}</div>
            </div>
            <ArrowLeftRight className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-sm mt-1">
            <span className="text-red-500 font-medium">{stats.maxTransaction.from}</span>
            <span className="mx-2 text-muted-foreground">pays</span>
            <span className="text-green-500 font-medium">{stats.maxTransaction.to}</span>
          </div>
        </div>
      </div>
    </div>
  );
}