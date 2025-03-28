import { useState, useEffect } from "react";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function AttendanceCard({ event, onAttendanceUpdate }) {
  const { toast } = useToast();
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [attendanceUpdated, setAttendanceUpdated] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);

  // Initialize selected attendees based on data from the database
  useEffect(() => {
    if (event.training_attendance) {
      const attendedIds = event.training_attendance
        .filter(attendee => attendee.attended)
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
              <Button 
                variant="outline" 
                onClick={openAddDialog}
                className="button-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Franchise
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Franchise</TableHead>
                <TableHead className="label-1 text-center">Status</TableHead>
                <TableHead className="label-1 text-center">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.training_attendance?.map((attendee: any) => (
                <TableRow key={attendee.id}>
                  <TableCell className="body-1">{attendee.franchises?.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`label-2 ${
                        selectedAttendees.includes(attendee.id)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedAttendees.includes(attendee.id) ? "Present" : "Absent"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAttendanceChange(attendee.id)}
                    >
                      {selectedAttendees.includes(attendee.id) ? (
                        <ChevronLeft className="h-5 w-5 text-green-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!event.training_attendance || event.training_attendance.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
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