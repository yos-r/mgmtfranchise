import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

interface EventDetailDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  const [materials, setMaterials] = useState<Material[]>([
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="tagline-2">{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="tagline-3">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="body-1">
                    {format(new Date(event.date), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="body-1">{event.time} ({event.duration})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="body-1">{event.attendees.length} attendees</span>
                </div>
                <Badge variant="outline" className="label-2">
                  {event.type}
                </Badge>
              </CardContent>
            </Card>

            {/* Learning Materials */}
            <Card>
              <CardHeader>
                <CardTitle className="tagline-3">Learning Materials</CardTitle>
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
          </div>

          <Separator />

          {/* Attendance Tracking */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="tagline-2">Attendance</h3>
              {attendanceUpdated && (
                <Button onClick={handleSaveAttendance} className="button-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}