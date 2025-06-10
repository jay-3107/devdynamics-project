// src/components/people/PersonAnalytics.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PersonAnalytics({ people, selectedPerson }) {
  const [person, setPerson] = useState(selectedPerson || null);
  const [analytics, setAnalytics] = useState({
    loading: false,
    data: {
      totalPaid: 0,
      totalShare: 0,
      expenseCount: 0,
      mostFrequentPartners: [],
      mostExpensiveCategory: "N/A",
      averageExpense: 0
    }
  });
  
  // When selectedPerson changes, update the current person
  useEffect(() => {
    if (selectedPerson) {
      setPerson(selectedPerson);
    }
  }, [selectedPerson]);
  
  // When person changes, fetch analytics
  useEffect(() => {
    if (!person) return;
    
    const fetchAnalytics = async () => {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      try {
        // This would be your API endpoint for analytics
        // Since it doesn't exist, we're simulating data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock analytics data
        const mockData = {
          totalPaid: Math.random() * 1000,
          totalShare: Math.random() * 800,
          expenseCount: Math.floor(Math.random() * 20) + 1,
          mostFrequentPartners: people
            .filter(p => p.name !== person.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(p => p.name),
          mostExpensiveCategory: ["Food", "Transport", "Utilities", "Entertainment"][
            Math.floor(Math.random() * 4)
          ],
          averageExpense: (Math.random() * 100) + 20
        };
        
        setAnalytics({
          loading: false,
          data: mockData
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchAnalytics();
  }, [person, people]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Person Analytics</h2>
        
        <Select 
          value={person?.name || ""} 
          onValueChange={(value) => {
            const newPerson = people.find(p => p.name === value);
            if (newPerson) setPerson(newPerson);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select person" />
          </SelectTrigger>
          <SelectContent>
            {people.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {!person ? (
        <div className="text-center p-12 bg-muted/50 rounded-lg text-muted-foreground">
          Select a person to view their analytics
        </div>
      ) : analytics.loading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <div className="mt-4 text-muted-foreground">Loading analytics...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Overview</CardTitle>
              <CardDescription>Summary of expense activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Paid</div>
                  <div className="text-xl font-bold">
                    ${analytics.data.totalPaid.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Share</div>
                  <div className="text-xl font-bold">
                    ${analytics.data.totalShare.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expense Count</div>
                  <div className="text-xl font-bold">
                    {analytics.data.expenseCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Net Balance</div>
                  <div className={`text-xl font-bold ${
                    analytics.data.totalPaid > analytics.data.totalShare
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {analytics.data.totalPaid > analytics.data.totalShare
                      ? `+$${(analytics.data.totalPaid - analytics.data.totalShare).toFixed(2)}`
                      : `-$${(analytics.data.totalShare - analytics.data.totalPaid).toFixed(2)}`
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Frequent Partners</CardTitle>
              <CardDescription>People most often in expenses with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.data.mostFrequentPartners.length > 0 ? (
                <div className="space-y-3">
                  {analytics.data.mostFrequentPartners.map((partnerName, index) => (
                    <div key={partnerName} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span>{partnerName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 10) + 1} expenses
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No partners found
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Insights</CardTitle>
              <CardDescription>Other analytics about this person's expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Most Expensive Category</div>
                  <div className="text-xl font-medium mt-1">{analytics.data.mostExpensiveCategory}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Expense</div>
                  <div className="text-xl font-medium mt-1">${analytics.data.averageExpense.toFixed(2)}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Last Expense</div>
                  <div className="text-xl font-medium mt-1">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}