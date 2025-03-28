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
  action: z.string().min(3, "Action must be at least 3 characters"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});

interface ActionPlanDialogProps {
  visitId: string;
  actionItem?: any; // Optional action item for editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "add" | "edit"; // Dialog mode
}

export function ActionPlanDialog({
  visitId,
  actionItem,
  open,
  onOpenChange,
  onSuccess,
  mode,
}: ActionPlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof actionSchema>>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      action: actionItem?.action || "",
      deadline: actionItem?.deadline || new Date().toISOString().split('T')[0],
      status: actionItem?.status || "pending",
    },
  });

  // Update form when actionItem changes
  useEffect(() => {
    if (actionItem && mode === "edit") {
      form.reset({
        action: actionItem.action,
        deadline: actionItem.deadline,
        status: actionItem.status,
      });
    } else if (mode === "add") {
      form.reset({
        action: "",
        deadline: new Date().toISOString().split('T')[0],
        status: "pending",
      });
    }
  }, [actionItem, form, mode]);

  const onSubmit = async (values: z.infer<typeof actionSchema>) => {
    setIsSubmitting(true);
    try {
      if (mode === "add") {
        // Insert new action plan
        const { error } = await supabase
          .from('support_action_plans')
          .insert({
            visit_id: visitId,
            action: values.action,
            deadline: values.deadline,
            status: values.status,
          });

        if (error) throw error;

        toast({
          title: "Action added",
          description: "The action has been added to the plan successfully",
        });
      } else {
        // Update existing action plan
        const { error } = await supabase
          .from('support_action_plans')
          .update({
            action: values.action,
            deadline: values.deadline,
            status: values.status,
          })
          .eq('id', actionItem.id);

        if (error) throw error;

        toast({
          title: "Action updated",
          description: "The action has been updated successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Error ${mode === "add" ? "adding" : "updating"} action:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "add" ? "add" : "update"} the action. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Action Item" : "Edit Action Item"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new action item to the support visit plan" 
              : "Update the existing action item"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter action item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
                {isSubmitting 
                  ? (mode === "add" ? "Adding..." : "Updating...") 
                  : (mode === "add" ? "Add Action" : "Update Action")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}