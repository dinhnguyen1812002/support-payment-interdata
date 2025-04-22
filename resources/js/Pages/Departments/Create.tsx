
import React, { useState } from "react"
import { Inertia } from "@inertiajs/inertia"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"

interface FormData {
    name: string
    description: string
}

interface CreateDepartmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateDepartmentDialog({ open, onOpenChange }: CreateDepartmentDialogProps) {
    const [formData, setFormData] = useState<FormData>({ name: "", description: "" })
    const [errors, setErrors] = useState<Partial<FormData>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // @ts-ignore
        Inertia.post('/departments', formData, {
            onError: (errors) => {
                setErrors(errors)
                setIsSubmitting(false)
            },
            onSuccess: () => {
                setFormData({ name: "", description: "" })
                setErrors({})
                setIsSubmitting(false)
                onOpenChange(false) // Close the dialog on success
            },
        })
    }

    const handleClose = () => {
        // Reset form when dialog closes
        setFormData({ name: "", description: "" })
        setErrors({})
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
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
                            {isSubmitting ? "Creating..." : "Create Department"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
