import React from "react";
import { Head } from "@inertiajs/react";
import { CategoryForm } from "@/Components/forms/category-form";
import AppLayout from "@/Layouts/AppLayout";

export default function Create() {
    return (
        <AppLayout title="Create Category" canLogin={false} canRegister={false} notifications={[]}>
            <Head title="Create Category" />
            <div className="container mx-auto py-10">
                <CategoryForm mode="create" />
            </div>
        </AppLayout>
    )
}
