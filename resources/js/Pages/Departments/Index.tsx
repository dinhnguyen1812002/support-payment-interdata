
import React, { useState } from "react"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card"
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Inertia } from "@inertiajs/inertia"
import { Link } from "@inertiajs/react"

import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar"
import { AppSidebar } from "@/Components/dashboard/app-sidebar"
import { SiteHeader } from "@/Components/dashboard/site-header"
import { Badge } from "@/Components/ui/badge"
import { CreateDepartmentDialog } from "./Create"


interface Department {
    id: number
    name: string
    description: string | null
    created_at: string
}

interface Props {
    departments?: {
        data: Department[]
        total: number
        per_page: number
        current_page: number
        last_page: number
        next_page_url: string | null
        prev_page_url: string | null
    }
    keyword?: string
    notifications?: any[]
}

export default function DepartmentCards({ departments, keyword = "", notifications = [] }: Props) {
    const [search, setSearch] = useState(keyword)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const handleSearch = () => {
        Inertia.get("/departments", { search }, { preserveState: true })
    }

    if (!departments || !departments.data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                            <div className="w-full border-none">
                                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle>Departments</CardTitle>
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-64">
                                            <Input
                                                type="search"
                                                placeholder="Search departments..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                                className="pr-8"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full"
                                                onClick={handleSearch}
                                            >
                                                <Search className="h-4 w-4" />
                                                <span className="sr-only">Search</span>
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Department
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {departments.data.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {departments.data.map((department) => (
                                                <Card key={department.id} className="h-full">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg uppercase">{department.name}</CardTitle>
                                                        <Badge variant="outline" className="w-fit">
                                                            Created: {formatDate(department.created_at)}
                                                        </Badge>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground min-h-[60px]">
                                                            {department.description || "No description available"}
                                                        </p>
                                                    </CardContent>
                                                    <CardFooter className="flex justify-between gap-2">
                                                        <div className="flex gap-2">
                                                            <Link href={`/departments/${department.id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/departments/${department.id}/edit`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Pencil className="h-4 w-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm("Are you sure you want to delete this department?")) {
                                                                    Inertia.delete(`/departments/${department.id}`, {
                                                                        onSuccess: () => {
                                                                            Inertia.reload()
                                                                        },
                                                                    })
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-24 border rounded-md">
                                            <p className="text-muted-foreground">No departments found.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => departments.prev_page_url && Inertia.get(departments.prev_page_url)}
                                            disabled={!departments.prev_page_url}
                                            className="w-full sm:w-auto"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>

                                        <div className="text-sm text-muted-foreground">
                                            Page {departments.current_page} of {departments.last_page} (Total: {departments.total}{" "}
                                            departments)
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => departments.next_page_url && Inertia.get(departments.next_page_url)}
                                            disabled={!departments.next_page_url}
                                            className="w-full sm:w-auto"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Department Dialog */}
                <CreateDepartmentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
            </SidebarInset>
        </SidebarProvider>
    )
}
