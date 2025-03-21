import React from "react"
import {usePage} from "@inertiajs/react";
import { Category } from "@/types";
import  CategoryForm from "@/Pages/Categories/category-form";
export default function EditCategory() {
    const { props } = usePage()
    const category = props.category as Category

    return (
        <div className="container mx-auto py-10">
            {/*<CategoryForm*/}
            {/*    initialData={{*/}
            {/*        title: category.title,*/}
            {/*        slug: category.slug,*/}
            {/*        description: category.description,*/}
            {/*    }}*/}
            {/*    isEditing={true}*/}
            {/*/>*/}
        </div>
    )
}


