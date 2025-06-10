// src/components/balances/BalancesPage.jsx
import React, { useState, useEffect } from "react";
import { BalanceSummary } from "./BalanceSummary";
import { BalanceTable } from "./BalanceTable";
import { BalanceCharts } from "./BalanceCharts";

function BalancesPage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/balances");
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setBalances(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Failed to load balances: Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching balances:", err);
        setError(`Failed to load balances: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalances();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Balance Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column - Balance Summary Cards and Chart */}
        <div className="space-y-6">
          <BalanceSummary balances={balances} />
          <BalanceCharts balances={balances} />
        </div>
        
        {/* Right column - Detailed Balance Table */}
        <div>
          <BalanceTable balances={balances} />
        </div>
      </div>
    </div>
  );
}

export default BalancesPage;