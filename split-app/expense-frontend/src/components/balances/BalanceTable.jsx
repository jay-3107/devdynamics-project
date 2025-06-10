// src/components/balances/BalanceTable.jsx
import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  ArrowUpDown, 
  Search,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export function BalanceTable({ balances }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("balance");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking on the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  // Sort and filter balances
  const displayBalances = [...balances]
    .filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Handle numeric fields
      if (["total_paid", "total_share", "balance"].includes(sortField)) {
        const aValue = parseFloat(a[sortField]);
        const bValue = parseFloat(b[sortField]);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle text fields
      const aValue = a[sortField]?.toString().toLowerCase() || "";
      const bValue = b[sortField]?.toString().toLowerCase() || "";
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">Balance Details</h2>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  {sortField === "name" && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("total_paid")}
              >
                <div className="flex items-center justify-end">
                  Paid
                  {sortField === "total_paid" && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("total_share")}
              >
                <div className="flex items-center justify-end">
                  Share
                  {sortField === "total_share" && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("balance")}
              >
                <div className="flex items-center justify-end">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Balance
                  {sortField === "balance" && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="ml-1 h-4 w-4" /> : 
                      <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {displayBalances.map((person) => {
              const balance = parseFloat(person.balance);
              
              return (
                <TableRow key={person.name}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell className="text-right">${person.total_paid}</TableCell>
                  <TableCell className="text-right">${person.total_share}</TableCell>
                  <TableCell 
                    className={`text-right font-medium ${
                      balance > 0 
                        ? "text-green-600" 
                        : balance < 0 
                          ? "text-red-600" 
                          : ""
                    }`}
                  >
                    {balance >= 0 ? `+$${person.balance}` : `-$${Math.abs(balance).toFixed(2)}`}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {displayBalances.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No matching balances found" : "No balance data available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}