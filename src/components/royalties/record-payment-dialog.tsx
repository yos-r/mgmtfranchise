import { useState } from 'react';
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

const formSchema = z.object({
  payment_date: z.date(),
  payment_method: z.string(),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
});

export function RecordPaymentDialog({ open, onOpenChange, payment, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_date: new Date(),
      payment_method: 'transfer',
      payment_reference: '',
      notes: '',
    },
  });
  
  async function onSubmit(data) {
    if (!payment?.id) {
      toast({
        title: "Error",
        description: "No payment selected for recording",
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
          // royalty_amount: payment.royalty_amount,
          // marketing_amount: payment.marketing_amount,
          payment_method: payment.payment_method,
          payment_reference: payment.payment_reference,
          due_date: payment.due_date,
          payment_date: payment.payment_date,
          notes: payment.notes,
          created_at: new Date().toISOString()
        });
      
      if (logError) throw logError;
      
      // 2. Update payment record
      const { error } = await supabase
        .from('royalty_payments')
        .update({
          payment_date: data.payment_date.toISOString(),
          payment_method: data.payment_method,
          payment_reference: data.payment_reference || null,
          notes: data.notes || null,
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment details for {payment?.period || (payment?.due_date && format(new Date(payment.due_date), 'MMM yyyy'))}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}