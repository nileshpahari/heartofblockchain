import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface CampaignCardProps {
    id: string
    name: string
    age: number
    location: string
    description: string
    image: string
    raised: number
    goal: number
    percentFunded: number
    tags: string[]
    urgency?: string
}

export default function CampaignCard({
                                         id,
                                         name,
                                         age,
                                         location,
                                         description,
                                         image,
                                         raised,
                                         goal,
                                         percentFunded,
                                         tags,
                                         urgency,
                                     }: CampaignCardProps) {
    return (
        <Card className="overflow-hidden">
            <div className="relative h-48 w-full">
                <Image src={image || "/placeholder.svg"} alt={`${name}'s campaign`} fill className="object-cover" />
            </div>
            <CardContent className="p-4">
                <div className="mb-2">
                    <h3 className="font-semibold">
                        {name}, {age} - {location}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
            <span>
              ${raised.toLocaleString()} of ${goal.toLocaleString()} raised
            </span>
                        <span>{percentFunded}% Funded</span>
                    </div>
                    <Progress value={percentFunded} className="h-2" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                    {urgency && (
                        <Badge variant="destructive" className="text-xs">
                            {urgency}
                        </Badge>
                    )}
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-4 pt-0">
                <Button className="w-full" size="sm">
                    Donate
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                    View Story
                </Button>
            </CardFooter>
        </Card>
    )
}
