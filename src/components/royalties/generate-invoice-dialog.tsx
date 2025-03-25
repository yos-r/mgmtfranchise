import { useState } from "react";
import { format } from "date-fns";
import { FileText, Send } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface GenerateInvoiceDialogProps {
  payment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateInvoiceDialog({ payment, open, onOpenChange }: GenerateInvoiceDialogProps) {
  const { toast } = useToast();

  const handleGenerate = () => {
    toast({
      title: "Invoice generated",
      description: "The invoice has been generated and sent",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tagline-2">Generate Invoice</DialogTitle>
          <DialogDescription className="body-lead">
            Generate and send invoice for {payment.franchiseName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invoice-number" className="label-1">Invoice Number</Label>
            <Input
              id="invoice-number"
              placeholder="INV-2024-001"
              className="body-1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="issue-date" className="label-1">Issue Date</Label>
            <Input
              id="issue-date"
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              className="body-1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="due-date" className="label-1">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              defaultValue={format(payment.dueDate, 'yyyy-MM-dd')}
              className="body-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} className="button-1">
            <Send className="mr-2 h-4 w-4" />
            Generate & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}