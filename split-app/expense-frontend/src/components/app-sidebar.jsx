import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Data for expense splitter app
const expenseSplitterData = {
  appName: "Expense Splitter",
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          url: "/",
          isActive: true,
        },
      ],
    },
    {
      title: "Expenses",
      items: [
        {
          title: "All Expenses",
          url: "/expenses",
        },
        {
          title: "Add New Expense",
          url: "/expenses/add",
        },
      ],
    },
    {
      title: "People",
      items: [
        {
          title: "Manage People",
          url: "/people",
        },
      ],
    },
    {
      title: "Settlements",
      items: [
        {
          title: "Balances",
          url: "/balances",
        },
        {
          title: "Settlement Plan",
          url: "/settlements",
        },
      ],
    },
    {
      title: "Groups",
      items: [
        {
          title: "Manage Groups",
          url: "/groups",
        },
        {
          title: "Create Group",
          url: "/groups/new",
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar {...props}>
      <SidebarHeader>
        <h2 className="px-4 py-2 text-xl font-semibold tracking-tight">
          {expenseSplitterData.appName}
        </h2>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each section */}
        {expenseSplitterData.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>)
  );
}