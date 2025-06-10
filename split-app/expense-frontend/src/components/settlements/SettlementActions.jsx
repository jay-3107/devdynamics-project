// src/components/settlements/SettlementActions.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Share2, Download } from "lucide-react";

export function SettlementActions({ settlements }) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const generateCSV = () => {
    // Create CSV content
    const headers = ["From", "To", "Amount"];
    const rows = settlements.map(s => [
      s.from_person,
      s.to_person,
      s.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'settlements.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Generate text for sharing
  const getShareText = () => {
    const date = new Date().toLocaleDateString();
    let text = `Expense Settlement Plan (${date})\n\n`;
    
    settlements.forEach((s, i) => {
      text += `${i + 1}. ${s.from_person} pays ${s.to_person}: $${s.amount}\n`;
    });
    
    return text;
  };
  
  return (
    <div className="mt-6 flex flex-col gap-2">
      <Button 
        variant="outline" 
        className="w-full flex gap-2 items-center justify-center"
        onClick={() => setShowShareDialog(true)}
      >
        <Share2 className="h-4 w-4" />
        Share Settlement Plan
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex gap-2 items-center justify-center"
        onClick={generateCSV}
      >
        <Download className="h-4 w-4" />
        Export as CSV
      </Button>
      
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Settlement Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Copy the text below to share with others
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-muted p-3 rounded-md max-h-60 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">{getShareText()}</pre>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                navigator.clipboard.writeText(getShareText());
              }}
            >
              Copy to Clipboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}