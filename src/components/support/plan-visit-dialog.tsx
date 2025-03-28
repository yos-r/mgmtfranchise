import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const visitSchema = z.object({
  franchise_id: z.string().min(1, "Franchise is required"),
  consultant_id: z.string().min(1, "Consultant is required"),
  type: z.enum(["quarterly_review", "technical_support", "performance_review"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  observations: z.string().optional(),
});

interface PlanVisitDialogProps {
  onSuccess?: () => void;
}

export function PlanVisitDialog({ onSuccess }: PlanVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      franchise_id: "",
      consultant_id: "",
      type: "quarterly_review",
      date: new Date().toISOString().split('T')[0],
      time: "10:00",
      duration: "2h",
      status: "scheduled",
      observations: "",
    },
  });

  // Fetch franchises and consultants
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch franchises
        const { data: franchisesData, error: franchisesError } = await supabase
          .from('franchises')
          .select('id, name')
          .order('name');

        if (franchisesError) throw franchisesError;
        setFranchises(franchisesData || []);

        // Fetch consultants from team_members table
        const { data: consultantsData, error: consultantsError } = await supabase
          .from('team_members')
          .select('id, first_name, last_name, role')
          .eq('role', 'consultant')  // Assuming consultants have this role
          .order('last_name');

        if (consultantsError) throw consultantsError;
        
        // Transform consultant data to include full name
        const formattedConsultants = consultantsData.map(consultant => ({
          id: consultant.id,
          name: `${consultant.first_name} ${consultant.last_name}`,
          role: consultant.role
        }));

        setConsultants(formattedConsultants);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data for planning visit.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof visitSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('support_visits')
        .insert({
          franchise_id: values.franchise_id,
          consultant_id: values.consultant_id,
          type: values.type,
          date: values.date,
          time: values.time,
          duration: values.duration,
          status: values.status,
          observations: values.observations,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Visit planned",
        description: "The support visit has been scheduled successfully",
      });

      form.reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error planning visit:", error);
      toast({
        title: "Error",
        description: "Failed to schedule the visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Plan Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan Support Visit</DialogTitle>
          <DialogDescription>
            Schedule a new support visit to a franchise
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="franchise_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a franchise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading franchises...</div>
                      ) : franchises.length > 0 ? (
                        franchises.map((franchise) => (
                          <SelectItem key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">No franchises found</div>
                      )}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Visit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quarterly_review">Quarterly Review</SelectItem>
                        <SelectItem value="technical_support">Technical Support</SelectItem>
                        <SelectItem value="performance_review">Performance Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consultant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a consultant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading consultants...</div>
                        ) : consultants.length > 0 ? (
                          consultants.map((consultant) => (
                            <SelectItem key={consultant.id} value={consultant.id}>
                              {consultant.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No consultants found</div>
                        )}
                      </SelectContent>
                    </Select>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any initial observations or notes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Visit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}