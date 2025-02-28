
import React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"

interface Question {
    id: number
    title: string
    slug: string
}

const PopularQuestions: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([])

    useEffect(() => {
        axios
            .get("/latest-posts")
            .then((response) => setQuestions(response.data))
            .catch((error) => console.error("Error fetching questions:", error))
    }, [])

    return (
        <Card className="w-full max-w-md bg-[#f9f9f9] border-0 shadow-none">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#2C3E50]">Popular Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-0">
                    {questions.map((question) => (
                        <a
                            key={question.id}
                            href={`/posts/${question.slug}`}
                            className={cn(
                                "flex items-center gap-2 p-3 rounded-lg text-customBlue  font-semibold",
                                " hover:text-blue-600  text-base",
                                "group",
                            )}
                        >
                            <ChevronRight className={cn("w-4 h-4 text-[#A5B6CD]", "group-hover:text-[#516A8B] transition-colors")} />
                            <span className="font-bold text-base text-[#516A8B]">{question.title}</span>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default PopularQuestions

