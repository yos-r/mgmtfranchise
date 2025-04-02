import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  description: z.string().optional(),
  selectedFranchises: z.array(z.string()).min(1, "Please select at least one franchise"),
});

interface Franchise {
  id: string;
  name: string;
}

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "training",
      time: "10:00",
      selectedFranchises: [],
    },
  });

  const selectedFranchiseIds = form.watch("selectedFranchises") || [];

  // Fetch franchises when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchFranchises();
    }
  }, [isOpen]);

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

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    try {
      // Start a transaction to ensure all operations succeed or fail together
      // First insert the event
      const { data: eventData, error: eventError } = await supabase
        .from('training_events')
        .insert({
          title: values.title,
          type: values.type,
          trainer: values.trainer,
          date: values.date,
          time: values.time,
          duration: values.duration,
          description: values.description,
          status: "scheduled",
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Then create attendance records for each selected franchise
      const attendanceRecords = values.selectedFranchises.map(franchiseId => ({
        event_id: eventData.id,
        franchise_id: franchiseId,
        attended: null,  // Using null here as this is what we saw in the sample data
        // atenn: 'pending'  // Adding a status field to track attendance state
      }));

      const { error: attendanceError } = await supabase
        .from('training_attendance')
        .insert(attendanceRecords);

      if (attendanceError) throw attendanceError;

      toast({
        title: "Event created",
        description: "The training event has been created successfully with attendees.",
      });
      
      setIsOpen(false);
      onEventCreated();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleFranchise = (franchiseId: string) => {
    const currentSelected = form.getValues("selectedFranchises") || [];
    
    if (currentSelected.includes(franchiseId)) {
      // Remove franchise if already selected
      form.setValue("selectedFranchises", 
        currentSelected.filter(id => id !== franchiseId), 
        { shouldValidate: true }
      );
    } else {
      // Add franchise if not selected
      form.setValue("selectedFranchises", 
        [...currentSelected, franchiseId], 
        { shouldValidate: true }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Schedule a new training session or meeting
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
                    <Input placeholder="Enter event title" {...field} />
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
                          <SelectValue placeholder="Select type" />
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
                      <Input placeholder="Enter trainer name" {...field} />
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
                      <Input placeholder="e.g., 2h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Event description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedFranchises"
              render={() => (
                <FormItem>
                  <FormLabel>Select Franchises</FormLabel>
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
              <Button type="submit">Create Event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}