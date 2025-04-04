import { useState, useEffect } from "react";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Check,
  X,
  CheckSquare,
  Square
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function AttendanceCard({ event, onAttendanceUpdate }) {
  const { toast } = useToast();
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  
  // New states for multi-select functionality
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Initialize selected attendees based on data from the database
  useEffect(() => {
    if (event.training_attendance) {
      const attendedIds = event.training_attendance
        .filter(attendee => attendee.attended === true)
        .map(attendee => attendee.id);
      
      setSelectedAttendees(attendedIds);
    }
  }, [event]);

  // Load franchises for the add dialog
  const loadFranchises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Filter out franchises that are already in the attendance list
      const existingFranchiseIds = event.training_attendance?.map(
        attendee => attendee.franchise_id
      ) || [];
      
      const availableFranchises = data.filter(
        franchise => !existingFranchiseIds.includes(franchise.id)
      );
      
      setFranchises(availableFranchises);
    } catch (error) {
      console.error("Error loading franchises:", error);
      toast({
        title: "Error",
        description: "Failed to load franchises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (attendeeId, isPresent) => {
    setSelectedAttendees(prev => {
      if (isPresent) {
        // Add to selected attendees if not already included
        return prev.includes(attendeeId) ? prev : [...prev, attendeeId];
      } else {
        // Remove from selected attendees
        return prev.filter(id => id !== attendeeId);
      }
    });
    
    setAttendanceUpdated(true);
  };

  const handleSaveAttendance = async () => {
    try {
      // Create an array of promises for each attendance update
      const updatePromises = event.training_attendance.map(async (attendee) => {
        const isAttended = selectedAttendees.includes(attendee.id);
        
        const { error } = await supabase
          .from('training_attendance')
          .update({ attended: isAttended })
          .eq('id', attendee.id)
          .eq('event_id', event.id);
          
        if (error) throw error;
        
        return { id: attendee.id, success: true };
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      toast({
        title: "Attendance saved",
        description: "Attendance records have been updated successfully",
      });
      
      setAttendanceUpdated(false);
      
      // Notify parent component if needed
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Update failed",
        description: "Failed to update attendance records",
        variant: "destructive"
      });
    }
  };

  const handleAddAttendee = async () => {
    if (!selectedFranchiseId) {
      toast({
        title: "No franchise selected",
        description: "Please select a franchise to add",
        variant: "destructive"
      });
      return;
    }

    setIsAddingAttendee(true);
    try {
      // Add the new attendance record
      const { data, error } = await supabase
        .from('training_attendance')
        .insert({
          event_id: event.id,
          franchise_id: selectedFranchiseId,
          attended: null // Initial attendance is null
        })
        .select('*, franchises(*)');

      if (error) throw error;

      toast({
        title: "Attendee added",
        description: "The franchise has been added to the attendance list",
      });

      // Close dialog and reset selection
      setIsAddDialogOpen(false);
      setSelectedFranchiseId('');

      // Notify parent component to refresh data
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Error adding attendee:", error);
      toast({
        title: "Error",
        description: "Failed to add the franchise to the attendance list",
        variant: "destructive"
      });
    } finally {
      setIsAddingAttendee(false);
    }
  };

  const openAddDialog = () => {
    loadFranchises();
    setIsAddDialogOpen(true);
  };

  // Handler for selecting/deselecting a row
  const handleRowSelect = (attendeeId) => {
    setSelectedRows(prev => {
      if (prev.includes(attendeeId)) {
        // If already selected, remove it
        return prev.filter(id => id !== attendeeId);
      } else {
        // If not selected, add it
        return [...prev, attendeeId];
      }
    });
  };

  // Handler for selecting/deselecting all rows
  const handleSelectAll = () => {
    if (isAllSelected) {
      // If all are currently selected, deselect all
      setSelectedRows([]);
    } else {
      // Select all attendees
      const allAttendeeIds = event.training_attendance?.map(attendee => attendee.id) || [];
      setSelectedRows(allAttendeeIds);
    }
    // Toggle the "all selected" state
    setIsAllSelected(!isAllSelected);
  };

  // Batch action to mark all selected as present
  const handleBatchMarkPresent = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No franchises selected",
        description: "Please select at least one franchise to mark as present",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingBatch(true);
    try {
      // Update the local state first
      const newSelectedAttendees = [...selectedAttendees];
      selectedRows.forEach(attendeeId => {
        if (!newSelectedAttendees.includes(attendeeId)) {
          newSelectedAttendees.push(attendeeId);
        }
      });
      setSelectedAttendees(newSelectedAttendees);
      
      // Create promises for each update
      const updatePromises = selectedRows.map(async (attendeeId) => {
        const { error } = await supabase
          .from('training_attendance')
          .update({ attended: true })
          .eq('id', attendeeId);
          
        if (error) throw error;
        
        return { id: attendeeId, success: true };
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      toast({
        title: "Batch update successful",
        description: `${selectedRows.length} franchises marked as present`,
      });
      
      // Clear selected rows
      setSelectedRows([]);
      setIsAllSelected(false);
      
      // Notify parent component if needed
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Error in batch update:", error);
      toast({
        title: "Batch update failed",
        description: "Failed to update attendance records",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Batch action to mark all selected as absent
  const handleBatchMarkAbsent = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No franchises selected",
        description: "Please select at least one franchise to mark as absent",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingBatch(true);
    try {
      // Update the local state first
      const newSelectedAttendees = selectedAttendees.filter(id => !selectedRows.includes(id));
      setSelectedAttendees(newSelectedAttendees);
      
      // Create promises for each update
      const updatePromises = selectedRows.map(async (attendeeId) => {
        const { error } = await supabase
          .from('training_attendance')
          .update({ attended: false })
          .eq('id', attendeeId);
          
        if (error) throw error;
        
        return { id: attendeeId, success: true };
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      toast({
        title: "Batch update successful",
        description: `${selectedRows.length} franchises marked as absent`,
      });
      
      // Clear selected rows
      setSelectedRows([]);
      setIsAllSelected(false);
      
      // Notify parent component if needed
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Error in batch update:", error);
      toast({
        title: "Batch update failed",
        description: "Failed to update attendance records",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Check if all rows are selected to update the header checkbox state
  useEffect(() => {
    if (event.training_attendance && event.training_attendance.length > 0) {
      const allSelected = event.training_attendance.every(attendee => 
        selectedRows.includes(attendee.id)
      );
      setIsAllSelected(allSelected && selectedRows.length > 0);
    }
  }, [selectedRows, event.training_attendance]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="tagline-2">Attendance</CardTitle>
            <div className="flex space-x-2">
              {attendanceUpdated && (
                <Button onClick={handleSaveAttendance} className="button-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
              {/* <Button 
                variant="outline" 
                onClick={openAddDialog}
                className="button-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Franchise
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-md">
              <span className="text-sm font-medium">
                {selectedRows.length} {selectedRows.length === 1 ? 'franchise' : 'franchises'} selected
              </span>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleBatchMarkPresent}
                  disabled={isProcessingBatch}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Mark Present
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleBatchMarkAbsent}
                  disabled={isProcessingBatch}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="mr-1 h-4 w-4" />
                  Mark Absent
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <div className="flex items-center justify-center">
                    <Checkbox 
                      id="select-all"
                      checked={isAllSelected} 
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead className="label-1">Franchise</TableHead>
                <TableHead className="label-1 text-center">Status</TableHead>
                {/* <TableHead className="label-1 text-center">Attendance</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.training_attendance?.map((attendee) => (
                <TableRow key={attendee.id} className={selectedRows.includes(attendee.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox 
                        id={`select-${attendee.id}`}
                        checked={selectedRows.includes(attendee.id)} 
                        onCheckedChange={() => handleRowSelect(attendee.id)}
                        aria-label={`Select ${attendee.franchises?.name}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="body-1">{attendee.franchises?.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`label-2 ${
                        attendee.attended === null 
                          ? "bg-yellow-100 text-yellow-800" 
                          : selectedAttendees.includes(attendee.id)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {attendee.attended === null 
                        ? "Pending" 
                        : selectedAttendees.includes(attendee.id) 
                          ? "Present" 
                          : "Absent"}
                    </Badge>
                  </TableCell>
                  {/* <TableCell className="text-center">
                    {attendee.attended === null ? (
                      // For pending status, show two separate buttons
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttendanceChange(attendee.id, true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-5 w-5 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttendanceChange(attendee.id, false);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                    ) : selectedAttendees.includes(attendee.id) ? (
                      // For present status - one button to mark absent
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttendanceChange(attendee.id, false);
                        }}
                      >
                        <ChevronLeft className="h-5 w-5 text-green-500" />
                      </Button>
                    ) : (
                      // For absent status - one button to mark present
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttendanceChange(attendee.id, true);
                        }}
                      >
                        <ChevronRight className="h-5 w-5 text-red-500" />
                      </Button>
                    )}
                  </TableCell> */}
                </TableRow>
              ))}
              {(!event.training_attendance || event.training_attendance.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No attendees registered for this event
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Franchise Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Franchise to Attendance</DialogTitle>
            <DialogDescription>
              Select a franchise to add to the attendance list for this training event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoading ? (
              <div className="text-center py-4">Loading franchises...</div>
            ) : franchises.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All franchises are already added to the attendance list.</p>
              </div>
            ) : (
              <Select
                value={selectedFranchiseId}
                onValueChange={setSelectedFranchiseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a franchise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {franchises.map(franchise => (
                      <SelectItem key={franchise.id} value={franchise.id}>
                        {franchise.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddAttendee}
              disabled={isAddingAttendee || !selectedFranchiseId || franchises.length === 0}
            >
              {isAddingAttendee ? 'Adding...' : 'Add Franchise'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}