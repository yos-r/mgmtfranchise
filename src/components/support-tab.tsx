import { useState } from "react";
import { format } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  Plus,
  Eye,
  Send,
  FileText,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Mail,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const visits = [
  {
    id: 1,
    franchise: "CENTURY 21 Saint-Germain",
    consultant: "Jean Dupont",
    date: "2024-04-15",
    time: "10:00",
    duration: "3h",
    status: "completed",
    type: "Quarterly Review",
    program: `1. Team Performance Review
2. Marketing Strategy Assessment
3. Technology Implementation Check
4. Training Needs Analysis`,
    report: {
      observations: `- Strong team collaboration
- Marketing materials need updating
- CRM usage could be improved
- Training needed for new agents`,
      actionPlan: [
        { action: "Update marketing materials", deadline: "2024-04-30", status: "pending" },
        { action: "Schedule CRM training", deadline: "2024-05-15", status: "pending" },
        { action: "Implement weekly team meetings", deadline: "2024-04-20", status: "completed" },
      ],
    },
  },
  {
    id: 2,
    franchise: "CENTURY 21 Confluence",
    consultant: "Marie Lambert",
    date: "2024-04-20",
    time: "14:00",
    duration: "2h",
    status: "scheduled",
    type: "Performance Review",
  },
];

function VisitDetail({ visit, onBack }: { visit: any; onBack: () => void }) {
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
        <Badge variant="outline" className="label-2">
          {visit.status}
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

function PlanVisitDialog() {
  const { toast } = useToast();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
1. Team Performance Review
2. Marketing Strategy Assessment
3. Technology Implementation Check
4. Training Needs Analysis
    `,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Plus className="mr-2 h-4 w-4" />
          Plan Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="tagline-2">Plan Assistance Visit</DialogTitle>
          <DialogDescription className="body-lead">
            Schedule a new franchise assistance visit
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="franchise" className="label-1">Franchise</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select franchise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saint-germain">CENTURY 21 Saint-Germain</SelectItem>
                  <SelectItem value="confluence">CENTURY 21 Confluence</SelectItem>
                  <SelectItem value="vieux-port">CENTURY 21 Vieux Port</SelectItem>
                  <SelectItem value="bordeaux">CENTURY 21 Bordeaux Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consultant" className="label-1">Consultant</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jean">Jean Dupont</SelectItem>
                  <SelectItem value="marie">Marie Lambert</SelectItem>
                  <SelectItem value="pierre">Pierre Martin</SelectItem>
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
            <Label htmlFor="type" className="label-1">Visit Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quarterly Review</SelectItem>
                <SelectItem value="performance">Performance Review</SelectItem>
                <SelectItem value="training">Training Support</SelectItem>
                <SelectItem value="technical">Technical Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="label-1">Visit Program</Label>
            <div className="min-h-[300px] border rounded-md p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              toast({
                title: "Visit planned",
                description: "The assistance visit has been scheduled",
              });
            }}
            className="button-1"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Plan Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SupportTab() {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  if (selectedVisit) {
    return <VisitDetail visit={selectedVisit} onBack={() => setSelectedVisit(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Franchise Support</h2>
          <p className="body-lead text-muted-foreground">
            Manage assistance visits and support programs
          </p>
        </div>
        <PlanVisitDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Planned Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">6</div>
            <p className="legal text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Completed Visits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">12</div>
            <p className="legal text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Active Action Plans</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">8</div>
            <p className="legal text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Support Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">45h</div>
            <p className="legal text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Assistance Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Franchise</TableHead>
                <TableHead className="label-1">Consultant</TableHead>
                <TableHead className="label-1">Type</TableHead>
                <TableHead className="label-1">Date & Time</TableHead>
                <TableHead className="label-1">Duration</TableHead>
                <TableHead className="label-1">Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <TableRow
                  key={visit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedVisit(visit)}
                >
                  <TableCell className="body-1 font-medium">
                    {visit.franchise}
                  </TableCell>
                  <TableCell className="body-1">{visit.consultant}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="label-2">
                      {visit.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="body-1">
                    {format(new Date(visit.date), "MMM d, yyyy")} at {visit.time}
                  </TableCell>
                  <TableCell className="body-1">{visit.duration}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        visit.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {visit.status}
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