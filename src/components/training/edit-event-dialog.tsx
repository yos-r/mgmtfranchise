import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["training", "meeting", "workshop"]),
  trainer: z.string().min(2, "Trainer name must be at least 2 characters"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  duration: z.string().min(1, "Please enter a duration"),
  // description: z.string().optional(),
  selectedFranchises: z.array(z.string()).min(1, "Please select at least one franchise"),
});

interface Franchise {
  id: string;
  name: string;
}

interface EditEventDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EditEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      type: event.type,
      trainer: event.trainer || "",
      date: event.date,
      time: event.time,
      duration: event.duration,
      // description: event.description || "",
      selectedFranchises: [],
    },
  });

  const selectedFranchiseIds = form.watch("selectedFranchises") || [];

  useEffect(() => {
    if (open) {
      fetchFranchises();
      fetchCurrentAttendees();
    }
  }, [open, event.id]);

  const fetchFranchises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setFranchises(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching franchises",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('training_attendance')
        .select('franchise_id')
        .eq('event_id', event.id);

      if (error) throw error;
      
      const attendeeIds = data.map(item => item.franchise_id);
      setCurrentAttendees(attendeeIds);
      
      // Set the form value
      form.setValue("selectedFranchises", attendeeIds, { shouldValidate: true });
    } catch (error: any) {
      console.error("Error fetching attendees:", error);
      toast({
        title: "Error",
        description: "Failed to load current attendees",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setIsSubmitting(true);
    try {
      // Update event details
      const { error: eventError } = await supabase
        .from('training_events')
        .update({
          title: values.title,
          type: values.type,
          trainer: values.trainer,
          date: values.date,
          time: values.time,
          duration: values.duration,
          // description: values.description,
        })
        .eq('id', event.id);

      if (eventError) throw eventError;

      // Handle attendees: find which franchises to add and which to remove
      const franchisesToAdd = values.selectedFranchises.filter(
        id => !currentAttendees.includes(id)
      );
      
      const franchisesToRemove = currentAttendees.filter(
        id => !values.selectedFranchises.includes(id)
      );

      // Add new attendees
      if (franchisesToAdd.length > 0) {
        const newAttendanceRecords = franchisesToAdd.map(franchiseId => ({
          event_id: event.id,
          franchise_id: franchiseId,
          attended: null,
        }));

        const { error: addError } = await supabase
          .from('training_attendance')
          .insert(newAttendanceRecords);

        if (addError) throw addError;
      }

      // Remove deleted attendees
      if (franchisesToRemove.length > 0) {
        // We need to delete each franchise attendance record individually
        for (const franchiseId of franchisesToRemove) {
          const { error: removeError } = await supabase
            .from('training_attendance')
            .delete()
            .eq('event_id', event.id)
            .eq('franchise_id', franchiseId);
  
          if (removeError) {
            console.error(`Error removing franchise ${franchiseId}:`, removeError);
            throw removeError;
          }
        }
      }

      toast({
        title: "Event updated",
        description: "The training event has been updated successfully with attendees",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFranchise = (franchiseId: string) => {
    const currentSelected = form.getValues("selectedFranchises") || [];
    
    if (currentSelected.includes(franchiseId)) {
      form.setValue("selectedFranchises", 
        currentSelected.filter(id => id !== franchiseId), 
        { shouldValidate: true }
      );
    } else {
      form.setValue("selectedFranchises", 
        [...currentSelected, franchiseId], 
        { shouldValidate: true }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the training event details and attendees
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trainer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="selectedFranchises"
              render={() => (
                <FormItem>
                  <FormLabel>Manage Attendees</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between"
                          role="combobox"
                        >
                          {selectedFranchiseIds.length 
                            ? `${selectedFranchiseIds.length} franchise(s) selected` 
                            : "Select franchises"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search franchises..." />
                          <CommandEmpty>No franchises found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-60">
                              {isLoading ? (
                                <div className="p-2 text-center">Loading franchises...</div>
                              ) : (
                                franchises.map((franchise) => (
                                  <CommandItem
                                    key={franchise.id}
                                    value={franchise.id}
                                    onSelect={() => toggleFranchise(franchise.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`border rounded-sm w-4 h-4 flex items-center justify-center ${
                                        selectedFranchiseIds.includes(franchise.id) 
                                        ? "bg-primary border-primary" 
                                        : "border-input"
                                      }`}>
                                        {selectedFranchiseIds.includes(franchise.id) && 
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        }
                                      </div>
                                      <span>{franchise.name}</span>
                                    </div>
                                  </CommandItem>
                                ))
                              )}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  {selectedFranchiseIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFranchiseIds.map(id => {
                        const franchise = franchises.find(f => f.id === id);
                        return franchise ? (
                          <Badge 
                            key={id} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {franchise.name}
                            <button 
                              type="button" 
                              className="ml-1 rounded-full text-xs"
                              onClick={() => toggleFranchise(id)}
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}