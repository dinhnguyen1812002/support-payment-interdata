import React from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Inertia} from "@inertiajs/inertia"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/Components/ui/form"
import {Input} from "@/Components/ui/input"
import {Textarea} from "@/Components/ui/textarea"
import {Button} from "@/Components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import {X} from "lucide-react"

// Define the validation schema
const formSchema = z.object({
    title: z
        .string()
        .min(2, {
            message: "Title must be at least 2 characters.",
        })
        .max(100, {
            message: "Title must not exceed 100 characters.",
        }),
    slug: z
        .string()
        .min(2, {
            message: "Slug must be at least 2 characters.",
        })
        .max(100, {
            message: "Slug must not exceed 100 characters.",
        })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message: "Slug must contain only lowercase letters, numbers, and hyphens.",
        }),
    description: z
        .string()
        .max(500, {
            message: "Description must not exceed 500 characters.",
        })
        .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    initialData?: {
        id?: number
        title?: string
        slug?: string
        description?: string
    },
    isEditing?: boolean,
    onSuccess?: () => void,
    isStandalone?: boolean
}

export default function CategoryDialogForm({
                                               open,
                                               onOpenChange,
                                               initialData,
                                               isEditing = false,
                                               onSuccess,
                                               isStandalone
                                           }: CategoryFormProps) {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
        },
    })

    // Reset form when initialData changes
    React.useEffect(() => {
        if (open) {
            form.reset({
                title: initialData?.title || "",
                slug: initialData?.slug || "",
                description: initialData?.description || "",
            })
        }
    }, [form, initialData, open])

    // Handle form submission
    const onSubmit = (values: FormValues) => {
        if (isEditing && initialData?.id) {
            // If editing, use PUT request
            Inertia.put(`/admin/categories/${initialData.id}`, values, {
                onSuccess: () => {
                    onOpenChange(false)
                    if (onSuccess) onSuccess()
                },
            })
        } else {
            // If creating new, use POST request
            Inertia.post("/admin/create-category", values, {
                onSuccess: () => {
                    onOpenChange(false)
                    if (onSuccess) onSuccess()
                },
            })
        }
    }


    const generateSlug = (title: string) => {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen

        form.setValue("slug", slug)
    }

    // Handle dialog close
    const handleDialogClose = () => {
        form.reset();
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>

                    </div>
                    <DialogDescription>
                        {isEditing ? "Update the details of your category" : "Fill in the details to create a new category"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter category title"
                                            {...field}
                                            onChange={(e) => {
                                                const titleValue = e.target.value;
                                                field.onChange(titleValue);
                                                generateSlug(titleValue);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>The name of your category as it will appear on the site.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="slug"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="enter-category-slug" {...field} />
                                    </FormControl>
                                    <FormDescription>The URL-friendly version of the name. Used in
                                        URLs.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter category description (optional)"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>A brief description of what this category
                                        contains.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={handleDialogClose}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditing ? "Update Category" : "Create Category"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

