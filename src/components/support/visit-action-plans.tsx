import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function VisitActionPlans({ franchiseId, onActionUpdated }) {
  const [actionPlans, setActionPlans] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newActionDeadline, setNewActionDeadline] = useState("");
  const [actionStatus, setActionStatus] = useState("pending");
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const { toast } = useToast();

  // Load action plans when franchiseId changes
  useEffect(() => {
    if (franchiseId) {
      fetchActionPlans();
    }
  }, [franchiseId]);

  const fetchActionPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_action_plans')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setActionPlans(data || []);
    } catch (error) {
      console.error("Error fetching action plans:", error);
      toast({
        title: "Error",
        description: "Failed to load action plans.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActionPlan = async () => {
    if (!newAction.trim() || !newActionDeadline || !franchiseId) return;
    
    try {
      const newActionPlan = {
        franchise_id: franchiseId,
        action: newAction,
        deadline: newActionDeadline,
        status: actionStatus,
      };
      
      const { data, error } = await supabase
        .from('support_action_plans')
        .insert(newActionPlan)
        .select()
        .single();
      
      if (error) throw error;
      
      setActionPlans([data, ...actionPlans]);
      resetActionForm();
      
      toast({
        title: "Success",
        description: "Action plan added successfully.",
      });
      
      if (onActionUpdated) onActionUpdated();
    } catch (error) {
      console.error("Error adding action plan:", error);
      toast({
        title: "Error",
        description: "Failed to add action plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateActionStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('support_action_plans')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setActionPlans(actionPlans.map(action => 
        action.id === id ? { ...action, status } : action
      ));
      
      toast({
        title: "Success",
        description: `Action status updated to "${status}".`,
      });
      
      if (onActionUpdated) onActionUpdated();
    } catch (error) {
      console.error("Error updating action status:", error);
      toast({
        title: "Error",
        description: "Failed to update action status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAction = async (id) => {
    try {
      const { error } = await supabase
        .from('support_action_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setActionPlans(actionPlans.filter(action => action.id !== id));
      
      toast({
        title: "Success",
        description: "Action plan deleted successfully.",
      });
      
      if (onActionUpdated) onActionUpdated();
    } catch (error) {
      console.error("Error deleting action plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete action plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetActionForm = () => {
    setNewAction("");
    setNewActionDeadline("");
    setActionStatus("pending");
    setIsAddingAction(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Action Plans</CardTitle>
          <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Action Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Action Plan</DialogTitle>
                <DialogDescription>
                  Create a new action plan for this franchise.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="action" className="text-sm font-medium">
                    Action
                  </label>
                  <Textarea
                    id="action"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Describe the action to be taken..."
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">
                    Deadline
                  </label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newActionDeadline}
                    onChange={(e) => setNewActionDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <select 
                    id="status"
                    className="w-full p-2 border rounded"
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={resetActionForm}>
                  Cancel
                </Button>
                <Button onClick={handleAddActionPlan} disabled={!newAction.trim() || !newActionDeadline}>
                  Add Action
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">
            Loading action plans...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionPlans.length > 0 ? (
                actionPlans.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.action}</TableCell>
                    <TableCell>
                      {format(new Date(action.deadline), "dd/MM/yyyy")}
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
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {action.status !== "completed" && (
                            <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "completed")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              Mark as Complete
                            </DropdownMenuItem>
                          )}
                          {action.status !== "in_progress" && (
                            <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "in_progress")}>
                              <Clock className="mr-2 h-4 w-4 text-blue-500" />
                              Mark as In Progress
                            </DropdownMenuItem>
                          )}
                          {action.status !== "pending" && (
                            <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "pending")}>
                              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                              Mark as Pending
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAction(action.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No action plans yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}