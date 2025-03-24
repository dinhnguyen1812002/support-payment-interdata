
import  React from "react"
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
    <Card
      className={cn(
        "w-full max-w-md border-0 shadow-none",
        "bg-[#f9f9f9]  dark:bg-[#1B1C22]",
        "transition-colors duration-200",
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className={cn("text-xl font-bold", "text-[#2C3E50] dark:text-gray-100")}>
            Most popular
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {questions.map((question) => (
            <a
              key={question.id}
              href={`/posts/${question.slug}`}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "text-customBlue dark:text-blue-300",
                "font-semibold text-base",
                "hover:text-blue-600 dark:hover:text-blue-400",
                "group transition-colors duration-200",
              )}
            >
              <button
                className={cn(
                  "flex items-center justify-center",
                  "w-5 h-5 rounded-lg",
                  "bg-gray-300 dark:bg-gray-600",
                  "group-hover:bg-blue-100 dark:group-hover:bg-blue-700",
                  "transition-colors duration-200",
                )}
              >
                <ChevronRight
                  className={cn(
                    "w-3 h-3",
                    "text-[#071437] dark:text-gray-300",
                    "group-hover:text-blue-600 dark:group-hover:text-blue-300",
                    "transition-colors duration-200",
                  )}
                />
              </button>

              <span
                className={cn(
                  "text-[#516A8B] dark:text-gray-300",
                  "font-medium leading-5 flex-1",
                  "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  "transition-colors duration-200",
                )}
              >
                {question.title}
              </span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PopularQuestions

