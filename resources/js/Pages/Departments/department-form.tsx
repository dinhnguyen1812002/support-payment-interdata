
import  React from "react"
import { useState, useEffect } from "react"
import { Inertia } from "@inertiajs/inertia"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { Label } from "@/Components/ui/label"
import { generateSlug } from "@/Utils/slugUtils"

interface Department {
    id?: number
    name: string
    description: string | null
    slug?: string
}

interface FormData {
    name: string
    description: string
}

interface DepartmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    department?: Department // Dữ liệu department cho edit
    mode: "create" | "edit" // Chế độ create hoặc edit
}

export default function DepartmentDialog({ open, onOpenChange, department, mode }: DepartmentDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        name: department?.name || "",
        description: department?.description || "",
    })

    // Separate state for the display-only slug
    const [displaySlug, setDisplaySlug] = useState<string>("")
    const [errors, setErrors] = useState<Partial<FormData>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

    // Update formData when department changes (for edit)
    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name || "",
                description: department.description || "",
            })
            // Initialize display slug from department if available
            setDisplaySlug(department.slug || generateSlug(department.name || ""))
        } else {
            setFormData({ name: "", description: "" })
            setDisplaySlug("")
        }
        setSlugManuallyEdited(false)
    }, [department])

    // Update slug when name changes (unless manually edited)
    useEffect(() => {
        if (!slugManuallyEdited && formData.name) {
            setDisplaySlug(generateSlug(formData.name))
        }
    }, [formData.name, slugManuallyEdited])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const method = mode === "create" ? Inertia.post : Inertia.put
        const url = mode === "create" ? "/departments" : `/departments/${department?.id}`

        // @ts-ignore - Only submit the formData, not the displaySlug
        method(url, formData, {
            onError: (errors) => {
                setErrors(errors)
                setIsSubmitting(false)
            },
            onSuccess: () => {
                setFormData({ name: "", description: "" })
                setDisplaySlug("")
                setErrors({})
                setIsSubmitting(false)
                onOpenChange(false) // Đóng dialog
            },
        })
    }

    const handleClose = () => {
        setFormData({ name: "", description: "" })
        setDisplaySlug("")
        setErrors({})
        setSlugManuallyEdited(false)
        onOpenChange(false)
    }

    const handleRegenerateSlug = () => {
        if (formData.name) {
            setDisplaySlug(generateSlug(formData.name))
            setSlugManuallyEdited(false)
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplaySlug(e.target.value)
        setSlugManuallyEdited(true)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Department" : "Edit Department"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="slug">Slug (Display Only)</Label>
                                {formData.name && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRegenerateSlug}
                                        className="h-6 text-xs"
                                    >
                                        Regenerate
                                    </Button>
                                )}
                            </div>
                            <Input
                                id="slug"
                                value={displaySlug}
                                onChange={handleSlugChange}
                                placeholder="url-friendly-name"
                                className="bg-muted/50"
                            />
                            <p className="text-muted-foreground text-xs">
                                This will be used in the URL: /departments/{displaySlug || "example-slug"}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? mode === "create"
                                    ? "Creating..."
                                    : "Updating..."
                                : mode === "create"
                                    ? "Create Department"
                                    : "Update Department"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
