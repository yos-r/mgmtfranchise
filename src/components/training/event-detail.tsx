import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Star,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditEventDialog } from "./edit-event-dialog";
import { NotesCard } from "./notes-card";
import { AttendanceCard } from "./attendance-card"; // Import the new AttendanceCard component

interface EventDetailProps {
  event: any;
  onBack: () => void;
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const { toast } = useToast();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [rating, setRating] = useState(event.trainer_rating || 0);
  const [ratingSession, setRatingSession] = useState(event.session_rating || 0);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);
    
    try {
      const { error } = await supabase
        .from('training_events')
        .update({
          trainer_rating: newRating
        })
        .eq('id', currentEvent.id);
        
      if (error) throw error;
      
      toast({
        title: "Rating updated",
        description: "The trainer rating has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating rating:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the trainer rating",
        variant: "destructive"
      });
    }
  };
  const handleRatingChangeSession = async (newRating: number) => {
    setRatingSession(newRating);
    
    try {
      const { error } = await supabase
        .from('training_events')
        .update({
          session_rating: newRating
        })
        .eq('id', currentEvent.id);
        
      if (error) throw error;
      
      toast({
        title: "Rating session updated",
        description: "The session rating has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating rating:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the session rating",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('training_events')
        .delete()
        .eq('id', currentEvent.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "The training event has been deleted successfully",
      });
      onBack();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttendanceUpdate = async () => {
    // Refresh the event data to get updated attendance list
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select(`
          *,
          training_attendance(
            *,
            franchises(*)
          )
        `)
        .eq('id', currentEvent.id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentEvent(data);
      }
    } catch (error) {
      console.error("Error refreshing event data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh event data",
        variant: "destructive",
      });
    }
  };

  // Use current event data from state to reflect updates
  const attendeeCount = currentEvent.training_attendance?.length || 0;
  const presentCount = currentEvent.training_attendance?.filter(a => a.attended)?.length || 0;
  const absentCount = attendeeCount - presentCount;
  const attendanceRate = attendeeCount > 0 ? Math.round((presentCount / attendeeCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h2 className="tagline-1">{currentEvent.title}</h2>
            <p className="body-lead text-muted-foreground">
              {format(new Date(currentEvent.date), "MMMM d, yyyy")} at {currentEvent.time}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="button-2"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this event? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Training Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-sm">{format(new Date(currentEvent.date), "MMMM d, yyyy")}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-sm">{currentEvent.duration}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Trainer</span>
                  </div>
                  <p className="text-sm">{currentEvent.trainer || 'Not assigned'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Topic</span>
                  </div>
                  <p className="text-sm">{currentEvent.title}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">
                  {currentEvent.description || 'No description available'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Replaced with the new AttendanceCard component */}
          <AttendanceCard 
            event={currentEvent} 
            onAttendanceUpdate={handleAttendanceUpdate} 
          />
        </div>

        <div className="space-y-6">
        <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Session Rating </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRatingChangeSession(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= ratingSession ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Trainer Rating – {event.trainer} </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRatingChange(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          

          <NotesCard eventId={currentEvent.id} initialNotes={currentEvent.notes} />

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="label-1">Total Attendees</span>
                  <span className="numbers">{attendeeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Present</span>
                  <span className="numbers text-green-600">
                    {presentCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Absent</span>
                  <span className="numbers text-red-600">
                    {absentCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Attendance Rate</span>
                  <span className="numbers text-blue-600">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditEventDialog
        event={currentEvent}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={() => {
          handleAttendanceUpdate();
          onBack();
        }}
      />
    </div>
  );
}