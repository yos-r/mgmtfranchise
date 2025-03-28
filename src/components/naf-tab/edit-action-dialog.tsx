import { useState, useEffect } from "react";
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

const actionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["advertising", "digital", "branding", "events"]),
  budget: z.string().transform(Number),
  spent: z.string().transform(Number),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});

interface MarketingAction {
  id: string;
  title: string;
  type: string;
  budget: number;
  spent: number;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  images?: { url: string; name: string }[];
  youtube_url?: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}

interface EditActionDialogProps {
  action: MarketingAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedAction: MarketingAction) => void;
}

export function EditActionDialog({
  action,
  open,
  onOpenChange,
  onSuccess,
}: EditActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Re-initialize the form when the action prop changes
  const form = useForm<z.infer<typeof actionSchema>>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      title: action.title,
      type: action.type,
      budget: action.budget.toString(),
      spent: action.spent.toString(),
      status: action.status,
      start_date: action.start_date.split('T')[0], // Format date for input[type=date]
      end_date: action.end_date.split('T')[0], // Format date for input[type=date]
      description: action.description || "",
    },
  });

  // Reset form when action changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: action.title,
        type: action.type,
        budget: action.budget.toString(),
        spent: action.spent.toString(),
        status: action.status,
        start_date: action.start_date.split('T')[0],
        end_date: action.end_date.split('T')[0],
        description: action.description || "",
      });
    }
  }, [action, open, form]);

  const onSubmit = async (values: z.infer<typeof actionSchema>) => {
    setIsSubmitting(true);
    try {
      // Call Supabase to update the database
      const { data, error } = await supabase
        .from('marketing_actions')
        .update({
          title: values.title,
          type: values.type,
          budget: values.budget,
          spent: values.spent,
          status: values.status,
          start_date: values.start_date,
          end_date: values.end_date,
          description: values.description,
        })
        .eq('id', action.id)
        .select();

      if (error) throw error;

      // Create the updated action object with all properties from the original action
      // but with the updated fields from the form
      const updatedAction: MarketingAction = {
        ...action,
        title: values.title,
        type: values.type,
        budget: values.budget,
        spent: values.spent,
        status: values.status,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || "",
      };

      // Pass the updated action to the parent component callback
      onSuccess(updatedAction);
      
      // Close the dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating action:", error);
      toast({
        title: "Error",
        description: "Failed to update the action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Marketing Action</DialogTitle>
          <DialogDescription>
            Update the marketing action details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="digital">Digital Marketing</SelectItem>
                        <SelectItem value="branding">Branding</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spent</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Input {...field} />
                  </FormControl>
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