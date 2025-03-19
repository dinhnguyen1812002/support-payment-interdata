import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/Components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import React from "react"

export function SectionCards() {
    return (
        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4
                        *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5
                        *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  flex flex-wrap gap-4 px-4 lg:px-6 ">

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        $1,250.00
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +12.5%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Visitors for the last 6 months
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>New Customers</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        1,234
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingDownIcon className="size-3" />
                            -20%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Down 20% this period <TrendingDownIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Acquisition needs attention
                    </div>
                </CardFooter>
            </Card>

        </div>
    )
}
