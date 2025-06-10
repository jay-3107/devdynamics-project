// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import AllExpenses from "@/components/AllExpenses"; // Import your AllExpenses component
import EditExpense from "@/components/expenses/EditExpense";
import AddExpense from "./components/expenses/AddExpense";
import BalancesPage from "./components/balances/BalancesPage";
import SettlementsPage from "./components/settlements/SettlementsPage";
import PeoplePage from "./components/people/PeoplePage";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Placeholder component for dashboard
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <div className="bg-muted/50 aspect-video rounded-xl" />
      <div className="bg-muted/50 aspect-video rounded-xl" />
      <div className="bg-muted/50 aspect-video rounded-xl" />
    </div>
    <div className="bg-muted/50 min-h-[40vh] flex-1 rounded-xl mt-4" />
  </div>
);


const Groups = () => <div>Groups Page</div>;
const CreateGroup = () => <div>Create Group Page</div>;

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-4">
        
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<AllExpenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/edit/:expenseId" element={<EditExpense />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/new" element={<CreateGroup />} />
            <Route path="/balances" element={<BalancesPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;