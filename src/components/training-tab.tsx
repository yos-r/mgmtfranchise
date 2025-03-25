import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Calendar,
  Clock,
  Users,
  Mail,
  Plus,
  Eye,
  Send,
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const meetings = [
  {
    id: 1,
    title: "Q2 Strategy Meeting",
    type: "meeting",
    date: "2024-04-15",
    time: "10:00",
    duration: "2h",
    attendees: [
      { id: 1, name: "Marie Laurent", franchise: "Saint-Germain", attended: true },
      { id: 2, name: "Thomas Bernard", franchise: "Confluence", attended: false },
      { id: 3, name: "Sophie Martin", franchise: "Vieux Port", attended: true },
    ],
  },
  {
    id: 2,
    title: "Digital Marketing Training",
    type: "training",
    date: "2024-04-20",
    time: "14:00",
    duration: "3h",
    attendees: [
      { id: 1, name: "Marie Laurent", franchise: "Saint-Germain", attended: null },
      { id: 2, name: "Thomas Bernard", franchise: "Confluence", attended: null },
      { id: 3, name: "Sophie Martin", franchise: "Vieux Port", attended: null },
    ],
  },
];

function EventDetail({ event, onBack }: { event: any; onBack: () => void }) {
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
Dear ${event.franchise},

Following our assistance visit on ${format(new Date(event.date), "MMMM d, yyyy")}, please find attached the visit report and action plan.

Key Observations:
${event.report?.observations}

Action Plan:
${event.report?.actionPlan.map((item: any) => `- ${item.action} (Due: ${item.deadline})`).join('\n')}

Please review and let us know if you have any questions.

Best regards,
${event.consultant}
CENTURY 21 Consultant
    `,
  });

  const [materials, setMaterials] = useState<any[]>([
    {
      id: 1,
      name: "Q2 Strategy Presentation.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedAt: "2024-04-10",
    },
    {
      id: 2,
      name: "Marketing Guidelines 2024.docx",
      type: "Document",
      size: "1.8 MB",
      uploadedAt: "2024-04-10",
    },
  ]);

  const { toast } = useToast();
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newMaterials = acceptedFiles.map((file, index) => ({
        id: materials.length + index + 1,
        name: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: format(new Date(), "yyyy-MM-dd"),
      }));
      setMaterials([...materials, ...newMaterials]);
      toast({
        title: "Materials uploaded",
        description: `${acceptedFiles.length} file(s) uploaded successfully`,
      });
    },
  });

  const [attendanceUpdated, setAttendanceUpdated] = useState(false);

  const handleAttendanceChange = (attendeeId: number) => {
    const updatedAttendees = event.attendees.map((attendee: any) =>
      attendee.id === attendeeId
        ? { ...attendee, attended: !attendee.attended }
        : attendee
    );
    event.attendees = updatedAttendees;
    setAttendanceUpdated(true);
  };

  const handleSaveAttendance = () => {
    toast({
      title: "Attendance saved",
      description: "Attendance records have been updated",
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
              <CardTitle className="tagline-2">Visit Program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] border rounded-md p-4">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Visit Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="label-1">Observations</Label>
                <div className="min-h-[200px] border rounded-md p-4">
                  <EditorContent editor={editor} />
                </div>
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
                            attendee.attended === null
                              ? "bg-yellow-100 text-yellow-800"
                              : attendee.attended
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {attendee.attended === null
                            ? "Pending"
                            : attendee.attended
                            ? "Present"
                            : "Absent"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAttendanceChange(attendee.id)}
                        >
                          {attendee.attended ? (
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
              <CardTitle className="tagline-2">Learning Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="body-1 mt-2">Drop files here or click to upload</p>
              </div>
              <div className="space-y-2">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="body-1 font-medium">{material.name}</p>
                        <p className="legal text-muted-foreground">
                          {material.type} • {material.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
                    {event.attendees.filter((a: any) => a.attended).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Absent</span>
                  <span className="numbers text-red-600">
                    {event.attendees.filter((a: any) => a.attended === false).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-1">Pending</span>
                  <span className="numbers text-yellow-600">
                    {event.attendees.filter((a: any) => a.attended === null).length}
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

function CreateEventDialog({ onEventCreated }: { onEventCreated: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
Dear Franchisees,

You are invited to attend our upcoming event. Please find the details below:

Date: [Event Date]
Time: [Event Time]
Duration: [Duration]

Please confirm your attendance.

Best regards,
CENTURY 21 Management
    `,
  });

  const { toast } = useToast();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="tagline-2">Create New Event</DialogTitle>
          <DialogDescription className="body-lead">
            Schedule a new meeting or training session
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="label-1">Event Title</Label>
              <Input id="title" placeholder="Enter event title" className="body-1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type" className="label-1">Event Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="label-1">Date</Label>
              <Input
                id="date"
                type="date"
                className="body-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="label-1">Time</Label>
              <Input
                id="time"
                type="time"
                className="body-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="label-1">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2h"
                className="body-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="label-1">Email Invitation</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="button-2"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview Email"}
              </Button>
            </div>
            {!showPreview ? (
              <div className="min-h-[300px] border rounded-md p-4">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="label-1">To:</p>
                        <p className="body-1 text-muted-foreground">all-franchisees@century21.fr</p>
                      </div>
                      <div>
                        <p className="label-1">Subject:</p>
                        <p className="body-1 text-muted-foreground">Invitation: [Event Title]</p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Preview email sent",
                description: "Check your inbox for the preview",
              });
            }}
            className="button-2"
          >
            Send Test Email
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Event created",
                description: "Invitations have been sent to all franchisees",
              });
              onEventCreated();
            }}
            className="button-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Create & Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TrainingTab() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('training_events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Training & Meetings</h2>
          <p className="body-lead text-muted-foreground">
            Schedule and manage training sessions and meetings
          </p>
        </div>
        <CreateEventDialog onEventCreated={loadEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">8</div>
            <p className="legal text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">85%</div>
            <p className="legal text-muted-foreground">
              Last 3 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Training Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">24h</div>
            <p className="legal text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Participation Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">92%</div>
            <p className="legal text-muted-foreground">
              Response rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Event</TableHead>
                <TableHead className="label-1">Type</TableHead>
                <TableHead className="label-1">Date & Time</TableHead>
                <TableHead className="label-1">Duration</TableHead>
                <TableHead className="label-1">Attendees</TableHead>
                <TableHead className="label-1">Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow
                  key={meeting.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEvent(meeting)}
                >
                  <TableCell className="body-1 font-medium">
                    {meeting.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="label-2">
                      {meeting.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="body-1">
                    {format(new Date(meeting.date), "MMM d, yyyy")} at {meeting.time}
                  </TableCell>
                  <TableCell className="body-1">{meeting.duration}</TableCell>
                  <TableCell className="body-1">
                    {meeting.attendees.length} invited
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        new Date(meeting.date) > new Date()
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {new Date(meeting.date) > new Date() ? "Upcoming" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="button-2">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}