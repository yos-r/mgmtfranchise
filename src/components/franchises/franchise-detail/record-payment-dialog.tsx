import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    method: 'transfer',
    date: format(new Date(), 'yyyy-MM-dd'),
    reference: '',
    notes: '',
  });

  // Reset form when dialog opens or payment changes
  useEffect(() => {
    if (open && payment) {
      setFormData({
        // amount: payment.amount ? payment.amount.toString() : '',
        method: 'transfer',
        date: format(new Date(), 'yyyy-MM-dd'),
        reference: '',
        notes: '',
      });
    }
  }, [open, payment]);

  const handleSubmit = async () => {
    if (!payment || !payment.id) {
      toast({
        title: "Error",
        description: "No payment selected",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payment data for submission
      const paymentData = {
        payment_date: formData.date,
        payment_method: formData.method,
        payment_reference: formData.reference || null,
        notes: formData.notes || null,
        status: 'paid'
      };

      // Update the existing payment
      const { error } = await supabase
        .from('royalty_payments')
        .update(paymentData)
        .eq('id', payment.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Payment recorded",
        description: "The payment has been recorded successfully",
      });
      
      onOpenChange(false);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {payment 
              ? `Record payment for ${payment.period || format(new Date(payment.due_date), 'MMM yyyy')}`
              : 'Record a new payment'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                readOnly
              />
            </div>
          </div> */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleInputChange('method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit Card</SelectItem>
                <SelectItem value="versement">Versement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input
              placeholder="Payment reference"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Additional notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}