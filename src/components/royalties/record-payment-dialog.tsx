import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any | null;
  onSuccess?: () => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date(),
    payment_method: "",
    payment_reference: "",
    notes: ""
  });

  // Set initial amount when payment changes
  useEffect(() => {
    if (payment) {
      setFormData(prev => ({
        ...prev,
        amount: payment.amount?.toString() || ""
      }));
    }
  }, [payment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, payment_date: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.amount) {
        throw new Error("Amount is required");
      }
      
      if (!formData.payment_method) {
        throw new Error("Payment method is required");
      }
      
      // Prepare data for update
      const updateData = {
        status: "paid",
        payment_date: formData.payment_date.toISOString(),
        payment_method: formData.payment_method,
        payment_reference: formData.payment_reference || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      };
      
      // Update payment
      const { error } = await supabase
        .from('royalty_payments')
        .update(updateData)
        .eq('id', payment.id);
      
      if (error) throw error;
      
      // Create log entry
      await supabase.from('payment_logs').insert({
        payment_id: payment.id,
        action: 'payment_recorded',
        details: {
          amount: formData.amount,
          payment_date: format(formData.payment_date, 'yyyy-MM-dd'),
          payment_method: formData.payment_method,
          payment_reference: formData.payment_reference,
          note: formData.notes,
          previous_status: payment.status
        }
      });
      
      toast({
        title: "Payment recorded",
        description: "The payment has been successfully recorded.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        amount: "",
        payment_date: new Date(),
        payment_method: "",
        payment_reference: "",
        notes: ""
      });
      
      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for the selected invoice.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {payment && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
              <div>
                <p className="text-sm font-medium">Franchise</p>
                <p className="text-sm text-muted-foreground">{payment.franchises?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-muted-foreground">
                  {payment.due_date ? format(new Date(payment.due_date), "MMM d, yyyy") : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-muted-foreground">€{payment.amount?.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{payment.status || "Unknown"}</p>
              </div>
            </div>
          )}
          
          {/* Amount - Pre-filled but editable */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full"
                required
              />
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_method" className="text-right">
              Payment Method
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleSelectChange("payment_method", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Payment Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_date" className="text-right">
              Payment Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.payment_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.payment_date ? (
                      format(formData.payment_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.payment_date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Payment Reference */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_reference" className="text-right">
              Reference
            </Label>
            <div className="col-span-3">
              <Input
                id="payment_reference"
                name="payment_reference"
                value={formData.payment_reference}
                onChange={handleChange}
                placeholder="Transaction ID or reference"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <div className="col-span-3">
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes here"
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}