import { useToast } from "@/hooks/use-toast";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight, Badge, ClipboardList, Clock, Eye, Mail, Plus, Table, Users } from "lucide-react";
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";

// interface VisitDetailProps {
//     visit:any;
//     onBack:()=>void;
// }
export function VisitDetail({ visit, onBack }: { visit: any; onBack: () => void }) {
    const [showEmailPreview, setShowEmailPreview] = useState(false);
    
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
        }),
      ],
      content: `
  Dear ${visit.franchise},
  
  Following our assistance visit on ${format(new Date(visit.date), "MMMM d, yyyy")}, please find attached the visit report and action plan.
  
  Key Observations:
  ${visit.report?.observations}
  
  Action Plan:
  ${visit.report?.actionPlan.map((item: any) => `- ${item.action} (Due: ${item.deadline})`).join('\n')}
  
  Please review and let us know if you have any questions.
  
  Best regards,
  ${visit.consultant}
  CENTURY 21 Consultant
      `,
    });
  
    const { toast } = useToast();
  
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="button-2">
              <ArrowRight className="mr-2 h-4 w-4" />
              Back to Visits
            </Button>
            <div>
              <h2 className="tagline-1">{visit.franchise}</h2>
              <p className="body-lead text-muted-foreground">
                {format(new Date(visit.date), "MMMM d, yyyy")} at {visit.time}
              </p>
            </div>
          </div>
          {/* <Badge variant="outline" className="label-2">
            {visit.status}
          </Badge> */}
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
  
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="label-1">Action Plan</Label>
                    <Button variant="outline" size="sm" className="button-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Action
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="label-1">Action</TableHead>
                        <TableHead className="label-1">Deadline</TableHead>
                        <TableHead className="label-1">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visit.report?.actionPlan.map((action: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="body-1">{action.action}</TableCell>
                          <TableCell className="body-1">
                            {format(new Date(action.deadline), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                action.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {action.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
  
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-1">Consultant</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">{visit.consultant}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-1">Type</Label>
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">{visit.type}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-1">Duration</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">{visit.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Send Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="label-1">Email Content</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmailPreview(!showEmailPreview)}
                      className="button-2"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showEmailPreview ? "Edit" : "Preview"}
                    </Button>
                  </div>
                  {showEmailPreview ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                          <EditorContent editor={editor} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="min-h-[200px] border rounded-md p-4">
                      <EditorContent editor={editor} />
                    </div>
                  )}
                </div>
                <Button
                  className="w-full button-1"
                  onClick={() => {
                    toast({
                      title: "Report sent",
                      description: "The visit report has been sent to the franchise",
                    });
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }