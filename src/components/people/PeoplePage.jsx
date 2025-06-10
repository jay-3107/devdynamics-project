// src/components/people/PeoplePage.jsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeopleDirectory } from "./PeopleDirectory";
import { PersonDetails } from "./PersonDetails";
import { GroupsManager } from "./GroupsManager";
import { PersonAnalytics } from "./PersonAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert"; // You may need to install this

// Local storage key for locally added people
const LOCAL_PEOPLE_KEY = "expense_tracker_local_people";

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

                // Fetch people from API
                const response = await fetch("https://expense-splitter-api-n53l.onrender.com/people/");

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Get locally added people
                const localPeopleJson = localStorage.getItem(LOCAL_PEOPLE_KEY);
                const localPeople = localPeopleJson ? JSON.parse(localPeopleJson) : [];

                if (data.success && Array.isArray(data.data)) {
                    // Combine API people with local people
                    // Make sure to avoid duplicates based on name
                    const apiPeopleNames = new Set(data.data.map(p => p.name.toLowerCase()));

                    // Filter out local people that now exist in the API
                    const uniqueLocalPeople = localPeople.filter(
                        p => !apiPeopleNames.has(p.name.toLowerCase())
                    );

                    // Update localStorage to remove duplicates
                    localStorage.setItem(LOCAL_PEOPLE_KEY, JSON.stringify(uniqueLocalPeople));

                    // Combine both lists
                    const combinedPeople = [
                        ...data.data,
                        ...uniqueLocalPeople
                    ];

                    setPeople(combinedPeople);
                } else {
                    console.error("Unexpected API response format:", data);
                    setError("Failed to load people: Invalid response format");
                }
            } catch (err) {
                console.error("Error fetching people:", err);
                setError(`Failed to load people: ${err.message}`);

                // If API fails, at least show local people
                const localPeopleJson = localStorage.getItem(LOCAL_PEOPLE_KEY);
                if (localPeopleJson) {
                    try {
                        const localPeople = JSON.parse(localPeopleJson);
                        setPeople(localPeople);
                        setError("Could not load people from server, showing locally added people only.");
                    } catch (e) {
                        // Local storage error
                    }
                }
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

    // Handle when a new person is added
    const handlePersonAdded = (newPerson) => {
        setPeople(prev => [...prev, newPerson]);
    };

    const handlePersonDelete = (deletedPerson) => {
        // Remove the person from the state
        setPeople(prev => prev.filter(p => p.name !== deletedPerson.name));

        // If the deleted person was the selected person, clear the selection
        if (selectedPerson && selectedPerson.name === deletedPerson.name) {
            setSelectedPerson(null);
            setActiveTab("directory");
        }
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

    if (error && people.length === 0) {
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

            {error && (
                <Alert variant="warning" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
                    {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
                </TabsList>

                <TabsContent value="directory">
                    <PeopleDirectory
                        people={people}
                        selectedPerson={selectedPerson}
                        onPersonSelect={handlePersonSelect}
                        onPersonAdded={handlePersonAdded}
                        onPersonDelete={handlePersonDelete}
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