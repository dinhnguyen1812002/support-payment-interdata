import { AppSidebar } from "@/Components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/Components/chart-area-interactive"
import { DataTable } from "@/Components/dashboard/data-table"
import { SectionCards } from "@/Components/dashboard/section-cards"
import { SiteHeader } from "@/Components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar"


import React from "react"
import AppLayout from "@/Layouts/AppLayout"
import CategoryTable from "@/Components/dashboard/Category/category-table"
import CatergorySection from "@/Components/dashboard/Category/CatergorySection"

export default function Page() {
  return (
    <AppLayout title={""} canLogin={false} canRegister={false} notifications={[]}>
        <CatergorySection />
    </AppLayout>
  )
}
