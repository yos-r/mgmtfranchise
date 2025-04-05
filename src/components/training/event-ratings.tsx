import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface EventRatingsProps {
  eventId: string;
  trainerRating: number;
  sessionRating: number;
  trainerName?: string;
  onTrainerRatingChange: (rating: number) => void;
  onSessionRatingChange: (rating: number) => void;
}

const EventRatings = ({
  eventId,
  trainerRating,
  sessionRating,
  trainerName = "",
  onTrainerRatingChange,
  onSessionRatingChange
}: EventRatingsProps) => {
  // Local state to immediately reflect UI changes
  const [localTrainerRating, setLocalTrainerRating] = useState(trainerRating);
  const [localSessionRating, setLocalSessionRating] = useState(sessionRating);
  const { toast } = useToast();
  
  // Update local state when props change
//   useEffect(() => {
//     setLocalTrainerRating(trainerRating);
//     setLocalSessionRating(sessionRating);
//   }, [trainerRating, sessionRating]);

  const handleTrainerRatingChange = async (newRating: number) => {
    try {
      // Immediately update local state for UI feedback
      setLocalTrainerRating(newRating);
      
      // Update database
      const { error } = await supabase
        .from('training_events')
        .update({
          trainer_rating: newRating
        })
        .eq('id', eventId);

      if (error) throw error;

      // Notify parent component
      onTrainerRatingChange(newRating);
      
    } catch (error) {
      console.error("Error updating trainer rating:", error);
      // Revert local state on error
      setLocalTrainerRating(trainerRating);
      toast({
        title: "Update failed",
        description: "Failed to update the trainer rating",
        variant: "destructive"
      });
    }
  };

  const handleSessionRatingChange = async (newRating: number) => {
    try {
      // Immediately update local state for UI feedback
      setLocalSessionRating(newRating);
      
      // Update database
      const { error } = await supabase
        .from('training_events')
        .update({
          session_rating: newRating
        })
        .eq('id', eventId);

      if (error) throw error;

      // Notify parent component
      onSessionRatingChange(newRating);
      
    } catch (error) {
      console.error("Error updating session rating:", error);
      // Revert local state on error
      setLocalSessionRating(sessionRating);
      toast({
        title: "Update failed",
        description: "Failed to update the session rating",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="space-y-3 mt-3">
        {/* Session Rating Section */}
        <div className="p-2 rounded-lg bg-gray-50/0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium">Session Rating</h3>
            <div className="text-2xl font-bold text-primary">
              {localSessionRating}<span className="text-lg text-gray-500">/5</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSessionRatingChange(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= localSessionRating
                        ? "text-relentlessgold fill-relentlessgold"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={localSessionRating ? (localSessionRating / 5) * 100 : 0}
                className="h-2 flex-grow"
              />
              <span className="text-xs text-gray-500 min-w-8 text-right">
                {localSessionRating ? `${Math.round((localSessionRating / 5) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Trainer Rating Section */}
        <div className="p-4 rounded-lg bg-gray-50/0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium">
              Trainer Rating
              {trainerName && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {trainerName}
                </span>
              )}
            </h3>
            <div className="text-2xl font-bold text-primary">
              {localTrainerRating}<span className="text-lg text-gray-500">/5</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTrainerRatingChange(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= localTrainerRating
                        ? "text-relentlessgold fill-relentlessgold"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={localTrainerRating ? (localTrainerRating / 5) * 100 : 0}
                className="h-2 flex-grow"
              />
              <span className="text-xs text-gray-500 min-w-8 text-right">
                {localTrainerRating ? `${Math.round((localTrainerRating / 5) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventRatings;