// src/components/settlements/SettlementsTable.jsx
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Check } from "lucide-react";

export function SettlementsTable({ settlements }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  
  // Filter settlements based on search term and selected person
  const filteredSettlements = settlements.filter(settlement => {
    // Search term filter
    const searchMatch = !searchTerm || 
      settlement.from_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.to_person.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Selected person filter
    const personMatch = !selectedPerson || 
      settlement.from_person === selectedPerson || 
      settlement.to_person === selectedPerson;
      
    return searchMatch && personMatch;
  });
  
  // Get unique people for filtering
  const uniquePeople = [...new Set(
    settlements.flatMap(s => [s.from_person, s.to_person])
  )].sort();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">Settlement Transactions</h2>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge 
          variant={selectedPerson === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedPerson("")}
        >
          All
        </Badge>
        {uniquePeople.map(person => (
          <Badge
            key={person}
            variant={selectedPerson === person ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedPerson(person === selectedPerson ? "" : person)}
          >
            {person}
          </Badge>
        ))}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payer</TableHead>
              <TableHead></TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredSettlements.map((settlement, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-red-500">
                  {settlement.from_person}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-green-500">
                  {settlement.to_person}
                </TableCell>
                <TableCell className="text-right">
                  ${parseFloat(settlement.amount).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            
            {filteredSettlements.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedPerson 
                    ? "No matching settlements found" 
                    : "No settlement transactions available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}