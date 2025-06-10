// src/components/people/PeoplePage.jsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeopleDirectory } from "./PeopleDirectory";
import { PersonDetails } from "./PersonDetails";
import { GroupsManager } from "./GroupsManager";
import { PersonAnalytics } from "./PersonAnalytics";

function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState("directory");
  
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/people/");
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setPeople(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Failed to load people: Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching people:", err);
        setError(`Failed to load people: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPeople();
  }, []);
  
  // Handle person selection - both update the person and switch to details tab
  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setActiveTab("details"); // Automatically switch to details tab
  };
  
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
      <h1 className="text-2xl font-semibold mb-6">People</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger 
            value="details"
            disabled={!selectedPerson}
          >
            {selectedPerson ? `${selectedPerson.name} Details` : "Person Details"}
          </TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="directory">
          <PeopleDirectory 
            people={people}
            selectedPerson={selectedPerson}
            onPersonSelect={handlePersonSelect}
          />
        </TabsContent>
        
        <TabsContent value="details">
          {selectedPerson ? (
            <PersonDetails person={selectedPerson} />
          ) : (
            <div className="text-center p-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Please select a person from the Directory tab to view their details.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="groups">
          <GroupsManager people={people} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <PersonAnalytics 
            people={people} 
            selectedPerson={selectedPerson}
            onPersonSelect={setSelectedPerson}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PeoplePage;