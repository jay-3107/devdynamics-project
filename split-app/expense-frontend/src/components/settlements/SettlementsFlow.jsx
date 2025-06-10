// src/components/settlements/SettlementsFlow.jsx
import React, { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";

export function SettlementsFlow({ settlements }) {
  const [hoveredTransaction, setHoveredTransaction] = useState(null);
  
  // Group settlements by people to show a cleaner view
  const personData = useMemo(() => {
    if (!settlements || settlements.length === 0) {
      return { people: [], connections: [] };
    }
    
    // Get unique people
    const uniquePeople = [...new Set(
      settlements.flatMap(s => [s.from_person, s.to_person])
    )];
    
    // Create map of all connections (from -> to)
    const connections = settlements.map(s => ({
      from: s.from_person,
      to: s.to_person,
      amount: parseFloat(s.amount).toFixed(2)
    }));
    
    // For each person, calculate total incoming and outgoing
    const people = uniquePeople.map(name => {
      const outgoing = settlements
        .filter(s => s.from_person === name)
        .reduce((sum, s) => sum + parseFloat(s.amount), 0);
        
      const incoming = settlements
        .filter(s => s.to_person === name)
        .reduce((sum, s) => sum + parseFloat(s.amount), 0);
      
      return {
        name,
        outgoing: outgoing.toFixed(2),
        incoming: incoming.toFixed(2)
      };
    });
    
    return {
      people: people.sort((a, b) => b.incoming - a.incoming),
      connections
    };
  }, [settlements]);
  
  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h2 className="text-lg font-medium mb-2">Settlement Flow</h2>
        <div className="text-center py-8 text-muted-foreground">
          No settlement transactions available
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Settlement Flow</h2>
      
      <div className="space-y-6">
        {/* People who receive money (creditors) */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-green-600">Will Receive Money</h3>
          {personData.people
            .filter(p => parseFloat(p.incoming) > 0)
            .map(person => (
              <div key={person.name} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-green-600">
                    +${person.incoming}
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {/* Visualization of money flow */}
        <div className="border-t border-b py-4 my-4">
          <h3 className="text-sm font-medium mb-3 text-gray-500">Transactions</h3>
          <div className="space-y-2">
            {personData.connections.map((connection, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md transition-colors ${
                  hoveredTransaction === index ? 'bg-gray-100' : ''
                }`}
                onMouseEnter={() => setHoveredTransaction(index)}
                onMouseLeave={() => setHoveredTransaction(null)}
              >
                <div className="flex items-center">
                  <div className="w-1/3 text-right text-red-500 font-medium">
                    {connection.from}
                  </div>
                  
                  <div className="flex-1 px-2 flex items-center justify-center">
                    <div className="h-0.5 flex-1 bg-gray-300"></div>
                    <div className="mx-1 text-xs text-gray-500">${connection.amount}</div>
                    <div className="h-0.5 flex-1 bg-gray-300"></div>
                  </div>
                  
                  <div className="w-1/3 text-green-500 font-medium">
                    {connection.to}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* People who need to pay (debtors) */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-red-600">Need to Pay</h3>
          {personData.people
            .filter(p => parseFloat(p.outgoing) > 0)
            .map(person => (
              <div key={person.name} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-red-600">
                    -${person.outgoing}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}