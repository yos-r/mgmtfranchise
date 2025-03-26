import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface PaymentDetailsDialogProps {
  payment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="tagline-2">Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label-1">Franchise</p>
              <p className="body-1">{payment.franchises.name}</p>
            </div>
            <div>
              <p className="label-1">Company</p>
              {/* <p className="body-1">{payment.companyName}</p> */}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="label-1">Amount</p>
              <p className="numbers text-xl">€{payment.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="label-1">Due Date</p>
              <p className="body-1">{format(payment.due_date, 'MMMM d, yyyy')}</p>
            </div>
            <div>
              <p className="label-1">Status</p>
              <Badge className={`mt-1 label-2`}>{payment.status}</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="label-1">Reference Number</p>
                  {/* <p className="body-1">{payment.reference}</p> */}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="body-1">Payment confirmation email</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}