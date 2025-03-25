import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  Download,
  CheckCircle2,
  User,
} from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface TicketDetailProps {
  ticket: any;
  onBack: () => void;
  onUpdate: () => void;
}

export function TicketDetail({ ticket, onBack, onUpdate }: TicketDetailProps) {
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const { toast } = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const { data, error } = await supabase.storage
          .from('ticket-attachments')
          .upload(`${ticket.id}/${file.name}`, file);

        if (error) {
          toast({
            title: "Error uploading file",
            description: error.message,
            variant: "destructive",
          });
          continue;
        }

        if (data) {
          const { error: attachmentError } = await supabase
            .from('ticket_attachments')
            .insert({
              ticket_id: ticket.id,
              name: file.name,
              url: data.path,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              type: file.type,
            });

          if (attachmentError) {
            toast({
              title: "Error saving attachment",
              description: attachmentError.message,
              variant: "destructive",
            });
          }
        }
      }

      onUpdate();
    },
  });

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase
      .from('help_desk_tickets')
      .update({
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', ticket.id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setStatus(newStatus);
    onUpdate();
  };

  const handleAssigneeChange = async (userId: string) => {
    const { error } = await supabase
      .from('help_desk_tickets')
      .update({ assigned_to: userId })
      .eq('id', ticket.id);

    if (error) {
      toast({
        title: "Error updating assignee",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAssignedTo(userId);
    onUpdate();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const { error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticket.id,
        content: comment,
      });

    if (error) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComment("");
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
          <div>
            <h2 className="tagline-1">{ticket.title}</h2>
            <p className="body-lead text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <Badge className={`label-2`}>
          {ticket.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="body-1 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {ticket.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="body-1 font-medium">
                          {comment.author?.first_name} {comment.author?.last_name}
                        </p>
                        <span className="legal text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="body-1 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" {...getRootProps()} className="button-2">
                    <input {...getInputProps()} />
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                  <Button onClick={handleAddComment} className="button-1">
                    <Send className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="label-1">Status</Label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Assigned To</Label>
                <Select value={assignedTo} onValueChange={handleAssigneeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Priority</Label>
                <Badge className="label-2">{ticket.priority}</Badge>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Category</Label>
                <Badge variant="outline" className="label-2">
                  {ticket.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Created</Label>
                <p className="body-1">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>

              {ticket.resolved_at && (
                <div className="space-y-2">
                  <Label className="label-1">Resolved</Label>
                  <p className="body-1">
                    {format(new Date(ticket.resolved_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ticket.attachments?.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="body-1 font-medium">{attachment.name}</p>
                        <p className="legal text-muted-foreground">
                          {attachment.type} • {attachment.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">Drop files here or click to upload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}