// src/components/settlements/SettlementsPage.jsx (updated)
import React, { useState, useEffect } from "react";
import { SettlementsSummary } from "./SettlementsSummary";
import { SettlementsTable } from "./SettlementsTable";
import { SettlementsFlow } from "./SettlementsFlow";
import { SettlementActions } from "./SettlementActions";

function SettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://expense-splitter-api-n53l.onrender.com/settlements");
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setSettlements(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Failed to load settlements: Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching settlements:", err);
        setError(`Failed to load settlements: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettlements();
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
      <h1 className="text-2xl font-semibold mb-6">Settlement Plan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column - Summary and Flow Visualization */}
        <div className="space-y-6">
          <SettlementsSummary settlements={settlements} />
          <SettlementsFlow settlements={settlements} />
          <SettlementActions settlements={settlements} />
        </div>
        
        {/* Right column - Detailed Settlements Table */}
        <div>
          <SettlementsTable settlements={settlements} />
        </div>
      </div>
    </div>
  );
}

export default SettlementsPage;