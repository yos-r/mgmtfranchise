import { useState, useEffect } from "react";
import { Calendar, Clock, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface EventRatingsProps {
    eventId: string;
    currentEvent: any

}

const EventInfo = ({
    eventId,
    currentEvent

}: EventRatingsProps) => {
    // Local state to immediately reflect UI changes

    const { toast } = useToast();


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{currentEvent.title}</CardTitle>
                        <CardDescription>
                            {format(new Date(currentEvent.date), "MMMM d, yyyy")} • {currentEvent.time} • {currentEvent.duration}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={
                        currentEvent.status === 'scheduled'
                            ? "bg-blue-100 text-blue-800"
                            : currentEvent.status === 'completed'
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                    }>
                        {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date
                        </div>
                        <p>{format(new Date(currentEvent.date), "MMMM d, yyyy")}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            Duration
                        </div>
                        <p>{currentEvent.duration}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            Trainer
                        </div>
                        <p>{currentEvent.trainer || 'Not assigned'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EventInfo;