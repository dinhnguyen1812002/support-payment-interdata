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
import {X, Upload} from "lucide-react"

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
    logo: z
        .any()
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
        logo?: string
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

    const [logoFile, setLogoFile] = React.useState<File | null>(null)
    const [logoPreview, setLogoPreview] = React.useState<string | null>(initialData?.logo || null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            logo: undefined,
        },
    })

    // Reset form when initialData changes
    React.useEffect(() => {
        if (open) {
            form.reset({
                title: initialData?.title || "",
                slug: initialData?.slug || "",
                description: initialData?.description || "",
                logo: undefined,
            })
            setLogoPreview(initialData?.logo || null)
            setLogoFile(null)
        }
    }, [form, initialData, open])

    // Handle logo file change
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            form.setValue('logo', file)
        }
    }

    // Handle logo removal
    const handleLogoRemove = () => {
        setLogoFile(null)
        setLogoPreview(null)
        form.setValue('logo', undefined)
    }

    // Handle form submission
    const onSubmit = (values: FormValues) => {
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('slug', values.slug)
        if (values.description) {
            formData.append('description', values.description)
        }
        if (logoFile) {
            formData.append('logo', logoFile)
        }

        if (isEditing && initialData?.id) {
            // If editing, use PUT request
            formData.append('_method', 'PUT')
            Inertia.post(`/admin/categories/${initialData.id}`, formData, {
                onSuccess: () => {
                    onOpenChange(false)
                    if (onSuccess) onSuccess()
                },
            })
        } else {
            // If creating new, use POST request
            Inertia.post("/admin/create-category", formData, {
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

                        <FormField
                            control={form.control}
                            name="logo"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Logo</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            {logoPreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                        onClick={handleLogoRemove}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="mt-2">
                                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                                                Upload a logo
                                                            </span>
                                                            <input
                                                                id="logo-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={handleLogoChange}
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>Upload a logo for this category (optional).</FormDescription>
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

