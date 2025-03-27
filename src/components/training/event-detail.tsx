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
  CheckCircle2,
  XCircle,
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
import { useToast } from "@/hooks/use-toast";

interface EventDetailProps {
  event: any;
  onBack: () => void;
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    toast({
      title: "Rating updated",
      description: "The trainer rating has been updated successfully",
    });
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Internal notes have been saved successfully",
    });
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
        <Badge variant="outline" className="label-2">
          {event.type}
        </Badge>
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
                  <p className="text-sm">John Smith</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Topic</span>
                  </div>
                  <p className="text-sm">Digital Marketing Strategies</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">
                  Comprehensive training on digital marketing strategies for real estate, 
                  including social media management, content creation, and lead generation.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Objectives</label>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Understanding digital marketing fundamentals</li>
                  <li>Creating effective social media strategies</li>
                  <li>Implementing lead generation campaigns</li>
                  <li>Measuring and analyzing marketing performance</li>
                </ul>
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
                  {event.attendees.map((attendee: any) => (
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
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add internal notes about the training session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px]"
              />
              <Button onClick={handleSaveNotes} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Save Notes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="label-1">Total Attendees</span>
                  <span className="numbers">{event.attendees.length}</span>
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
                    {event.attendees.length - selectedAttendees.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Attendance Rate</span>
                  <span className="numbers text-blue-600">
                    {Math.round((selectedAttendees.length / event.attendees.length) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}