import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Receipt } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface RecordPaymentDialogProps {
  payment: {
    id: string;
    amount: number;
    franchises?: {
      name: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded?: () => void;
}

export function RecordPaymentDialog({ 
  payment, 
  open, 
  onOpenChange, 
  onPaymentRecorded 
}: RecordPaymentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDate(new Date());
      setPaymentMethod('');
      setReferenceNumber('');
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a payment date",
        variant: "destructive"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the existing payment record instead of creating a new one
      const { data, error } = await supabase
        .from('royalty_payments')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          payment_reference: referenceNumber || null,
          payment_date: format(date, 'yyyy-MM-dd'),
          notes: `Payment received via ${paymentMethod}${referenceNumber ? ` (Ref: ${referenceNumber})` : ''}`
        })
        .eq('id', payment.id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Payment Recorded",
        description: `Payment of €${payment.amount.toLocaleString()} marked as paid`,
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      if (onPaymentRecorded) {
        onPaymentRecorded();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const franchiseName = payment.franchises?.name || "this franchise";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tagline-2">Record Payment</DialogTitle>
          <DialogDescription className="body-lead">
            Record payment details for {franchiseName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* <div className="grid gap-2">
            <Label htmlFor="amount" className="label-1">Amount</Label>
            <Input
              id="amount"
              value={`€${payment.amount.toLocaleString()}`}
              readOnly
              className="body-1"
            />
          </div> */}
          <div className="grid gap-2">
            <Label className="label-1">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`body-1 justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="method" className="label-1">Payment Method</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="versement">Versement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reference" className="label-1">Reference Number</Label>
            <Input 
              id="reference" 
              placeholder="Enter reference number" 
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="body-1" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="button-1"
            disabled={isSubmitting}
          >
            <Receipt className="mr-2 h-4 w-4" />
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}