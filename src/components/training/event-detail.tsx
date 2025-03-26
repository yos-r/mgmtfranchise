import { useToast } from "@/hooks/use-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Save, Table, CheckCircle2, XCircle, Upload, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import Link from '@tiptap/extension-link';
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Badge } from "@/components/ui/badge";

interface EventDetailProps{
    event:any,
    onBack:()=>void
}
export function EventDetail({event, onBack}:EventDetailProps){
  
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