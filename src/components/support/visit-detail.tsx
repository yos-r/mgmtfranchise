import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditVisitDialog } from "./edit-visit-dialog";
import { ActionPlanDialog } from "./action-plan-dialog";

interface VisitDetailProps {
  visit: any;
  onBack: () => void;
  visitId?: string;
  consultants?: Record<string, any>;
  franchises?: Record<string, any>;
  onVisitUpdated?: () => void;
}

export function VisitDetail({ 
  visit: initialVisit, 
  onBack, 
  visitId, 
  consultants = {}, 
  franchises = {},
  onVisitUpdated
}: VisitDetailProps) {
  const [visit, setVisit] = useState(initialVisit);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!visitId);
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false);
  const [actionPlan, setActionPlan] = useState<any[]>([]);
  
  // Action dialog states
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionDialogMode, setActionDialogMode] = useState<"add" | "edit">("add");
  const [selectedAction, setSelectedAction] = useState<any>(null);
  
  // Action deletion dialog
  const [isActionDeleteDialogOpen, setIsActionDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<any>(null);
  
  const { toast } = useToast();

  // Fetch visit data if visitId is provided
  useEffect(() => {
    fetchVisitData();
  }, [visitId, consultants, franchises]);

  // Function to fetch visit data
  const fetchVisitData = async () => {
    if (!visitId && !initialVisit?.id) {
      return;
    }

    const id = visitId || initialVisit?.id;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('support_visits')
        .select(`
          id,
          franchise_id,
          consultant_id,
          type,
          date,
          time,
          duration,
          status,
          observations,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch action plans separately
      const { data: actionData, error: actionError } = await supabase
        .from('support_action_plans')
        .select('*')
        .eq('visit_id', id)
        .order('deadline', { ascending: true });

      if (actionError) throw actionError;

      // Use franchise and consultant lookup if available
      const franchiseName = franchises[data.franchise_id] || 
        (await fetchFranchiseName(data.franchise_id));
      
      const consultantName = consultants[data.consultant_id]?.name || 
        (await fetchConsultantName(data.consultant_id));

      // Transform data to match component expectations
      const transformedVisit = {
        id: data.id,
        franchise: franchiseName,
        franchise_id: data.franchise_id,
        consultant: consultantName,
        consultant_id: data.consultant_id,
        type: data.type,
        date: data.date,
        time: data.time || '00:00',
        duration: data.duration,
        status: data.status,
        observations: data.observations
      };

      setVisit(transformedVisit);
      setActionPlan(actionData || []);
    } catch (error) {
      console.error("Error fetching visit details:", error);
      toast({
        title: "Error",
        description: "Failed to load visit details. Please try again.",
        variant: "destructive",
      });
      onBack(); // Go back if we can't load the visit
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch franchise name if not in lookup
  const fetchFranchiseName = async (franchiseId) => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('name')
        .eq('id', franchiseId)
        .single();
      
      if (error) throw error;
      return data?.name || 'Unknown Franchise';
    } catch (error) {
      console.error("Error fetching franchise:", error);
      return 'Unknown Franchise';
    }
  };

  // Helper function to fetch consultant name if not in lookup
  const fetchConsultantName = async (consultantId) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('first_name, last_name')
        .eq('id', consultantId)
        .single();
      
      if (error) throw error;
      return data ? `${data.first_name} ${data.last_name}` : 'Unknown Consultant';
    } catch (error) {
      console.error("Error fetching consultant:", error);
      return 'Unknown Consultant';
    }
  };

  // Handle visit deletion
  const handleDeleteVisit = async () => {
    setIsDeleting(true);
    try {
      // First delete related action plans
      await supabase
        .from('support_action_plans')
        .delete()
        .eq('visit_id', visit.id);

      // Then delete the visit
      const { error } = await supabase
        .from('support_visits')
        .delete()
        .eq('id', visit.id);

      if (error) throw error;

      toast({
        title: "Visit deleted",
        description: "The support visit has been deleted successfully",
      });
      
      if (onVisitUpdated) {
        onVisitUpdated();
      }
      
      onBack();
    } catch (error: any) {
      console.error("Error deleting visit:", error);
      toast({
        title: "Error",
        description: "Failed to delete the visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle adding a new action
  const handleAddAction = () => {
    setSelectedAction(null);
    setActionDialogMode("add");
    setIsActionDialogOpen(true);
  };

  // Handle editing an action
  const handleEditAction = (action) => {
    setSelectedAction(action);
    setActionDialogMode("edit");
    setIsActionDialogOpen(true);
  };

  // Handle deleting an action
  const handleDeleteAction = async () => {
    if (!actionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('support_action_plans')
        .delete()
        .eq('id', actionToDelete.id);

      if (error) throw error;

      toast({
        title: "Action deleted",
        description: "The action item has been deleted successfully",
      });
      
      // Refresh action plan
      fetchVisitData();
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete the action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionDeleteDialogOpen(false);
      setActionToDelete(null);
    }
  };

  // Function to handle action status update
  const handleActionStatusUpdate = async (action, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_action_plans')
        .update({ status: newStatus })
        .eq('id', action.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Action status changed to ${newStatus}`,
      });
      
      // Refresh action plan
      fetchVisitData();
    } catch (error) {
      console.error("Error updating action status:", error);
      toast({
        title: "Error",
        description: "Failed to update the action status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle attendance change
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

  // Save attendance
  const handleSaveAttendance = async () => {
    // Implement saving attendance to Supabase
    // This would depend on your attendance table structure
    
    toast({
      title: "Attendance saved",
      description: "Attendance records have been updated successfully",
    });
    setAttendanceUpdated(false);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Handle visit update success
  const handleVisitUpdateSuccess = () => {
    fetchVisitData();
    if (onVisitUpdated) {
      onVisitUpdated();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading visit details...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p>Visit not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Visits
          </Button>
          <div>
            <h2 className="tagline-1">{visit.franchise}</h2>
            <p className="body-lead text-muted-foreground">
              {format(new Date(visit.date), "MMMM d, yyyy")} {visit.time && `at ${visit.time}`}
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
            Edit Visit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Visit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Support Visit</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this support visit? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteVisit}
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
              <CardTitle className="tagline-2">Visit Program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="text-sm">{format(new Date(visit.date), "MMMM d, yyyy")}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <p className="text-sm">{visit.duration}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Consultant</span>
                  </div>
                  <p className="text-sm">{visit.consultant}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Visit Type</span>
                  </div>
                  <Badge variant="outline">{visit.type}</Badge>
                </div>

                {visit.program && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Program</span>
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {visit.program}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="tagline-2">Action Plan</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="button-2"
                  onClick={handleAddAction}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="label-1">Action</TableHead>
                    <TableHead className="label-1">Deadline</TableHead>
                    <TableHead className="label-1">Status</TableHead>
                    <TableHead className="w-[100px] text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionPlan.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="body-1">{action.action}</TableCell>
                      <TableCell className="body-1">
                        {format(new Date(action.deadline), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(action.status)}>
                          {action.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAction(action)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Action
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setActionToDelete(action);
                                setIsActionDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Action
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {action.status !== "completed" && (
                              <DropdownMenuItem onClick={() => handleActionStatusUpdate(action, "completed")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {action.status !== "in_progress" && (
                              <DropdownMenuItem onClick={() => handleActionStatusUpdate(action, "in_progress")}>
                                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                Mark as In Progress
                              </DropdownMenuItem>
                            )}
                            {action.status !== "pending" && (
                              <DropdownMenuItem onClick={() => handleActionStatusUpdate(action, "pending")}>
                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            {action.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleActionStatusUpdate(action, "cancelled")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Mark as Cancelled
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {actionPlan.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No actions defined yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="tagline-2">Observations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {visit.observations || "No observations recorded"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Visit Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusBadgeClass(visit.status)}>
                    {visit.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline">{visit.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration</span>
                  <span>{visit.duration}</span>
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
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visit.attendees?.map((attendee: any) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary"
                  >
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-muted-foreground">{attendee.role}</p>
                    </div>
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
                  </div>
                ))}
                {(!visit.attendees || visit.attendees.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No attendees registered
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Visit Dialog */}
      <EditVisitDialog
        visit={visit}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={handleVisitUpdateSuccess}
      />
      
      {/* Action Plan Dialog for adding/editing actions */}
      <ActionPlanDialog
        visitId={visit.id}
        actionItem={selectedAction}
        open={isActionDialogOpen}
        onOpenChange={setIsActionDialogOpen}
        onSuccess={fetchVisitData}
        mode={actionDialogMode}
      />
      
      {/* Action Delete Confirmation Dialog */}
      <AlertDialog open={isActionDeleteDialogOpen} onOpenChange={setIsActionDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Action Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this action item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}