import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";

interface Department {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

interface Props {
    department: Department;
}

export default function DepartmentShow({ department }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{department.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{department.description || 'N/A'}</p>
                </div>
                <div className="mb-4">
                    <h3 className="text-sm font-medium">Created At</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(department.created_at)}</p>
                </div>
                <div className="flex gap-4">
                    <Link href={`/departments/${department.id}/edit`} className="btn btn-primary">
                        <Button variant="ghost">Edit</Button>
                    </Link>
                    <Link href="/departments" className="btn btn-secondary">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
