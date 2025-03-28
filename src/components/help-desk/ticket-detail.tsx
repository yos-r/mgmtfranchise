import { useState, useEffect } from "react";
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
  Trash2
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

interface TicketDetailProps {
  ticket: any;
  onBack: () => void;
  onUpdate: () => void;
}

export function TicketDetail({ ticket: initialTicket, onBack, onUpdate }: TicketDetailProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(initialTicket.status);
  const [assignedTo, setAssignedTo] = useState(initialTicket.assigned_to || "unassigned");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load team members on component mount
  useEffect(() => {
    const loadTeamMembers = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, first_name, last_name, role')
        .order('last_name');
      
      if (error) {
        toast({
          title: "Error loading team members",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setTeamMembers(data || []);
    };
    
    loadTeamMembers();
  }, [toast]);

  // Function to refresh ticket data locally
  const refreshTicketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('help_desk_tickets')
        .select(`
          *,
          franchise:franchises(name),
          assignee:team_members(first_name, last_name),
          comments:ticket_comments(
            *,
            author:team_members(first_name, last_name)
          ),
          attachments:ticket_attachments(*)
        `)
        .eq('id', initialTicket.id)
        .single();

      if (error) throw error;
      
      setTicket(data);
      setStatus(data.status);
      setAssignedTo(data.assigned_to || "unassigned");
    } catch (error) {
      console.error("Error refreshing ticket data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh ticket data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setIsLoading(true);
      let uploadSuccess = false;
      
      try {
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
            } else {
              uploadSuccess = true;
            }
          }
        }

        if (uploadSuccess) {
          toast({
            title: "Files uploaded",
            description: "Attachment(s) added successfully",
          });
          
          // Refresh ticket data to show new attachments
          await refreshTicketData();
          
          // Also notify parent component
          onUpdate();
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('help_desk_tickets')
        .update({
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', ticket.id);

      if (error) throw error;

      setStatus(newStatus);
      
      // Refresh ticket data to show updated status
      await refreshTicketData();
      
      // Also notify parent component
      onUpdate();
      
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    setIsLoading(true);
    try {
      // If "unassigned" is selected, set assigned_to to null in the database
      const assignedValue = userId === "unassigned" ? null : userId;
      
      const { error } = await supabase
        .from('help_desk_tickets')
        .update({ assigned_to: assignedValue })
        .eq('id', ticket.id);

      if (error) throw error;

      setAssignedTo(userId);
      
      // Refresh ticket data
      await refreshTicketData();
      
      // Also notify parent component
      onUpdate();
      
      toast({
        title: "Assignee updated",
        description: userId === "unassigned" 
          ? "Ticket unassigned" 
          : `Ticket assigned to ${teamMembers.find(m => m.id === userId)?.first_name} ${teamMembers.find(m => m.id === userId)?.last_name}`,
      });
    } catch (error) {
      toast({
        title: "Error updating assignee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticket.id,
          content: comment,
        });

      if (error) throw error;

      setComment("");
      
      // Refresh ticket data to show new comment
      await refreshTicketData();
      
      // Also notify parent component
      onUpdate();
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .download(attachment.url);

      if (error) {
        throw error;
      }

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error downloading file',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAttachment = async (attachment) => {
    setIsLoading(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ticket-attachments')
        .remove([attachment.url]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('ticket_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: 'Attachment deleted',
        description: 'The file has been removed successfully',
      });
      
      // Refresh ticket data to update attachments list
      await refreshTicketData();
      
      // Also notify parent component
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error deleting attachment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    setIsDeleting(true);
    try {
      // Delete all attachments from storage
      if (ticket.attachments && ticket.attachments.length > 0) {
        const filesToDelete = ticket.attachments.map(att => att.url);
        await supabase.storage
          .from('ticket-attachments')
          .remove(filesToDelete);
      }

      // Delete all comments
      await supabase
        .from('ticket_comments')
        .delete()
        .eq('ticket_id', ticket.id);

      // Delete all attachments from database
      await supabase
        .from('ticket_attachments')
        .delete()
        .eq('ticket_id', ticket.id);

      // Finally delete the ticket
      const { error } = await supabase
        .from('help_desk_tickets')
        .delete()
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Ticket deleted",
        description: "The ticket has been deleted successfully",
      });
      
      onBack();
    } catch (error) {
      toast({
        title: "Error deleting ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

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
        <div className="flex items-center space-x-2">
          <Badge className={`label-2 ${getStatusBadgeClass(ticket.status)}`}>
            {ticket.status}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting || isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Ticket
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this ticket? This action cannot be undone
                  and will remove all associated comments and attachments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTicket}>
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
                {(!ticket.comments || ticket.comments.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No comments yet</p>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    {...getRootProps()} 
                    className="button-2"
                    disabled={isLoading}
                  >
                    <input {...getInputProps()} />
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                  <Button 
                    onClick={handleAddComment} 
                    className="button-1"
                    disabled={isLoading || !comment.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? 'Sending...' : 'Add Comment'}
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
                <Select 
                  value={status} 
                  onValueChange={handleStatusChange}
                  disabled={isLoading}
                >
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
                <Select 
                  value={assignedTo} 
                  onValueChange={handleAssigneeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
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
                <Badge className={`label-2 ${getPriorityBadgeClass(ticket.priority)}`}>
                  {ticket.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Category</Label>
                <Badge variant="outline" className="label-2">
                  {ticket.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="label-1">Franchise</Label>
                <p className="body-1">
                  {ticket.franchise?.name || "Unknown"}
                </p>
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
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDownloadAttachment(attachment)}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAttachment(attachment)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!ticket.attachments || ticket.attachments.length === 0) && (
                  <p className="text-center text-muted-foreground py-2">No attachments</p>
                )}

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors mt-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} disabled={isLoading} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">
                    {isLoading ? 'Uploading...' : 'Drop files here or click to upload'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function for priority badge colors
function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}