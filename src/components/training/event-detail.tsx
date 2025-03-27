import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Star,
  FileText,
  Save,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { NotesCard } from "./notes-card"; // Import the new NotesCard component

interface EventDetailProps {
  event: any;
  onBack: () => void;
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(event.trainer_rating || 0);
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false);
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
        .eq('id', event.id);
        
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

  const handleAttendanceChange = (attendeeId: number) => {
    setSelectedAttendees(prev => {
      const isSelected = prev.includes(attendeeId);
      if (isSelected) {
        return prev.filter(id => id !== attendeeId);
      } else {
        return [...prev, attendeeId];
      }
    });
    setAttendanceUpdated(true);
  };

  const handleSaveAttendance = () => {
    toast({
      title: "Attendance saved",
      description: "Attendance records have been updated successfully",
    });
    setAttendanceUpdated(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('training_events')
        .delete()
        .eq('id', event.id);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h2 className="tagline-1">{event.title}</h2>
            <p className="body-lead text-muted-foreground">
              {format(new Date(event.date), "MMMM d, yyyy")} at {event.time}
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
                  <p className="text-sm">{format(new Date(event.date), "MMMM d, yyyy")}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-sm">{event.duration}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Trainer</span>
                  </div>
                  <p className="text-sm">{event.trainer || 'Not assigned'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Topic</span>
                  </div>
                  <p className="text-sm">{event.title}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">
                  {event.description || 'No description available'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="tagline-2">Attendance</CardTitle>
                {attendanceUpdated && (
                  <Button onClick={handleSaveAttendance} className="button-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="label-1">Name</TableHead>
                    <TableHead className="label-1">Franchise</TableHead>
                    <TableHead className="label-1 text-center">Status</TableHead>
                    <TableHead className="label-1 text-center">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.attendees?.map((attendee: any) => (
                    <TableRow key={attendee.id}>
                      <TableCell className="body-1 font-medium">
                        {attendee.name}
                      </TableCell>
                      <TableCell className="body-1">{attendee.franchise}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`label-2 ${
                            selectedAttendees.includes(attendee.id)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedAttendees.includes(attendee.id) ? "Present" : "Absent"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAttendanceChange(attendee.id)}
                        >
                          {selectedAttendees.includes(attendee.id) ? (
                            <ChevronLeft className="h-5 w-5 text-green-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!event.attendees || event.attendees.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No attendees registered for this event
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Trainer Rating</CardTitle>
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

          {/* Replace the old notes section with the new NotesCard component */}
          <NotesCard eventId={event.id} initialNotes={event.notes} />

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="label-1">Total Attendees</span>
                  <span className="numbers">{event.attendees?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Present</span>
                  <span className="numbers text-green-600">
                    {selectedAttendees.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Absent</span>
                  <span className="numbers text-red-600">
                    {(event.attendees?.length || 0) - selectedAttendees.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Attendance Rate</span>
                  <span className="numbers text-blue-600">
                    {event.attendees?.length ? Math.round((selectedAttendees.length / event.attendees.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditEventDialog
        event={event}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={onBack}
      />
    </div>
  );
}