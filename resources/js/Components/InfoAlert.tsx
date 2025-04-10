import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {CircleCheckBigIcon, InfoIcon } from "lucide-react";
import React  from  'react';
interface alterProps{

  title :string;
  content: string
}
export default function AlertInfoDemo({title, content}: alterProps) {

    return (
        <Alert className="border-emerald-600/50 text-emerald-600 dark:border-emerald-600 [&>svg]:text-emerald-600">
            <CircleCheckBigIcon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {content}
            </AlertDescription>
        </Alert>

    );
}
