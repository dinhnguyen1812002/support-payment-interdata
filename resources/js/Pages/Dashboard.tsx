import { AppSidebar } from "@/Components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/Components/chart-area-interactive"
import { DataTable } from "@/Components/dashboard/data-table"
import { SectionCards } from "@/Components/dashboard/section-cards"
import { SiteHeader } from "@/Components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar"


import React from "react"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={"Dashboard"} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
