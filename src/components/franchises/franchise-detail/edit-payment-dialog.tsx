import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// Define form schema with Zod
const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  royalty_amount: z.coerce.number().positive('Royalty amount must be positive'),
  marketing_amount: z.coerce.number().positive('Marketing amount must be positive'),
  due_date: z.date(),
  payment_date: z.date().optional(),
  payment_method: z.string().optional(),
  payment_reference: z.string().optional(),
  status: z.string(),
  period: z.string(),
  notes: z.string().optional(),
});

export function EditPaymentDialog({ open, onOpenChange, payment, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with useForm hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      royalty_amount: 0,
      marketing_amount: 0,
      due_date: new Date(),
      payment_date: undefined,
      payment_method: '',
      payment_reference: '',
      status: 'pending',
      period: '',
      notes: '',
    },
  });
  
  // Update form when payment changes
  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount || payment.total_amount || 0,
        royalty_amount: payment.royalty_amount || 0,
        marketing_amount: payment.marketing_amount || 0,
        due_date: new Date(payment.due_date),
        payment_date: payment.payment_date ? new Date(payment.payment_date) : undefined,
        payment_method: payment.payment_method || '',
        payment_reference: payment.payment_reference || '',
        status: payment.status || 'pending',
        period: payment.period || format(new Date(payment.due_date), 'MMM yyyy'),
        notes: payment.notes || '',
      });
    }
  }, [payment, form]);
  
  // Handle form submission
  async function onSubmit(data) {
    if (!payment?.id) {
      toast({
        title: "Error",
        description: "No payment selected for editing",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. First, create a log of the current payment state before updating
      const { error: logError } = await supabase
        .from('payment_logs')
        .insert({
          payment_id: payment.id,
          status: payment.status,
          amount: payment.amount || payment.total_amount,
          payment_method: payment.payment_method,
          payment_reference: payment.payment_reference,
          due_date: payment.due_date,
          payment_date: payment.payment_date,
          notes: payment.notes,
          created_at: new Date().toISOString()
        });
      
      if (logError) throw logError;
      
      // 2. Calculate total amount based on royalty and marketing
      // Ensure we're working with numbers, not strings
      const totalAmount = Number(data.royalty_amount) + Number(data.marketing_amount);
      
      // 3. Update payment record
      const { error } = await supabase
        .from('royalty_payments')
        .update({
          amount: totalAmount,
          royalty_amount: data.royalty_amount,
          marketing_amount: data.marketing_amount,
          due_date: data.due_date.toISOString(),
          payment_date: data.payment_date ? data.payment_date.toISOString() : null,
          payment_method: data.payment_method === "none" ? null : data.payment_method,
          payment_reference: data.payment_reference || null,
          status: data.status,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment details updated successfully",
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Update total amount when royalty or marketing amounts change
  useEffect(() => {
    // Get values and ensure they're treated as numbers
    const royaltyAmount = Number(form.watch('royalty_amount') || 0);
    const marketingAmount = Number(form.watch('marketing_amount') || 0);
    
    // Calculate the total as a number
    const total = royaltyAmount + marketingAmount;
    
    // Update the form value
    form.setValue('amount', total);
  }, [form.watch('royalty_amount'), form.watch('marketing_amount')]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Details</DialogTitle>
          <DialogDescription>
            Update the payment information for this royalty payment.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="grace">Grace Period</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
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
                name="royalty_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Royalty Amount (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => {
                        // Explicitly set as number
                        field.onChange(Number(e.target.value));
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="marketing_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Amount (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => {
                        // Explicitly set as number
                        field.onChange(Number(e.target.value));
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Auto-calculated from royalty and marketing amounts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select if paid</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Add any additional notes here..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}