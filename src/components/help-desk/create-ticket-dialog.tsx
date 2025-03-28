import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const ticketSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["technical", "billing", "general", "training", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  franchiseId: z.string().uuid("Please select a franchise"),
});

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: () => void;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  onTicketCreated,
}: CreateTicketDialogProps) {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: "medium",
      category: "general",
    },
  });

  useEffect(() => {
    if (open) {
      loadFranchises();
    }
  }, [open]);

  const loadFranchises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      setFranchises(data || []);
    } catch (error) {
      toast({
        title: "Error loading franchises",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('help_desk_tickets')
        .insert({
          title: values.title,
          description: values.description,
          category: values.category,
          priority: values.priority,
          franchise_id: values.franchiseId,
          status: "open" // Default status for new tickets
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Ticket created",
        description: "The support ticket has been created successfully",
      });

      form.reset();
      onTicketCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="tagline-2">Create Support Ticket</DialogTitle>
          <DialogDescription className="body-lead">
            Create a new support ticket for a franchise
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">Title</FormLabel>
                  <FormControl>
                    <Input className="body-1" placeholder="Brief summary of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="body-1 min-h-[100px]"
                      placeholder="Detailed description of the issue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="franchiseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">Franchise</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select franchise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">Loading franchises...</div>
                      ) : franchises.length > 0 ? (
                        franchises.map((franchise) => (
                          <SelectItem key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-muted-foreground">No franchises found</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="button-1" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}