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
import { Category } from "@/types"


export default function Page({categories}: {categories: Category[]  }) {
  return (
    <AppLayout title={"Hệ thống hỗ trợ khách hàng"} canLogin={true} canRegister={true} notifications={[]}>
        <CatergorySection   categories={categories}/>
    </AppLayout>
  )
}
