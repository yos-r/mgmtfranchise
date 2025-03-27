import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Euro, Plus, Receipt, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";
import { RecordPaymentDialog } from './record-payment-dialog';

export function PaymentsHistory({ franchise }: any) {
const [payments, setPayments] = useState<any[]>([]);
const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
const [isRecordingPayment, setIsRecordingPayment] = useState(false);
const [isViewingDetails, setIsViewingDetails] = useState(false);
const [loading, setLoading] = useState(true);
const { toast } = useToast();

const loadPayments = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('royalty_payments')
    .select('*,franchises(*)')
    .eq('franchise_id', franchise.id)
    .order('due_date', { ascending: true });
  
  if (!error && data) {
    setPayments(data);
    console.log('payments are', data);
  } else if (error) {
    console.error("Error loading payments:", error);
    toast({
      title: "Error",
      description: "Failed to load payment history",
      variant: "destructive"
    });
  }
  
  setLoading(false);
};

useEffect(() => {
  loadPayments();
  
  // Setup realtime subscription for payment updates
  const channel = supabase
    .channel('royalty_payments_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'royalty_payments',
      filter: `franchise_id=eq.${franchise.id}`
    }, () => {
      console.log("Royalty payments updated, reloading...");
      loadPayments();
    }).subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  }
}, [franchise.id]);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    case 'upcoming':
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    case 'late':
      return <Badge variant="destructive">Late</Badge>;
    case 'grace':
      return <Badge className="bg-blue-100 text-blue-800">Grace Period</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const handleViewDetails = (payment: any) => {
  setSelectedPayment(payment);
  setIsViewingDetails(true);
};

const handleRecordPayment = (payment: any) => {
  setSelectedPayment(payment);
  setIsRecordingPayment(true);
};

return (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Royalty Payments History</CardTitle>
      {/* Commented out as in original code
      <Button onClick={() => {
        setSelectedPayment(null);
        setIsRecordingPayment(true);
      }}>
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </Button> */}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="text-center py-4">Loading payment history...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No payment records found for this franchise</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Royalty</TableHead>
              <TableHead>Marketing</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.period || format(new Date(payment.due_date), 'MMM yyyy')}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Euro className="h-3 w-3 text-muted-foreground" />
                    <span>{payment.amount?.toLocaleString() || payment.total_amount?.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Euro className="h-3 w-3 text-muted-foreground" />
                    <span>{payment.royalty_amount?.toLocaleString() || payment.total_amount?.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Euro className="h-3 w-3 text-muted-foreground" />
                    <span>{payment.marketing_amount?.toLocaleString() || payment.total_amount?.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(payment.due_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {payment.payment_date
                    ? format(new Date(payment.payment_date), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>{payment.payment_method || '-'}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {(payment.status === 'pending' || payment.status === 'upcoming' || payment.status === 'late' || payment.status === 'grace') ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecordPayment(payment)}
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Record Payment
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Record Payment Dialog - Now using the separate component */}
      <RecordPaymentDialog
        open={isRecordingPayment}
        onOpenChange={setIsRecordingPayment}
        payment={selectedPayment}
        onSuccess={loadPayments}
      />

      {/* View Payment Details Dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              {selectedPayment?.period || (selectedPayment?.due_date && format(new Date(selectedPayment.due_date), 'MMM yyyy'))}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="text-lg font-medium">
                  €{(selectedPayment?.amount || selectedPayment?.total_amount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p>{selectedPayment?.status && getStatusBadge(selectedPayment.status)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p>{selectedPayment?.due_date && format(new Date(selectedPayment.due_date), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Date</Label>
                <p>{selectedPayment?.payment_date 
                  ? format(new Date(selectedPayment.payment_date), 'MMM d, yyyy')
                  : '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Method</Label>
                <p>{selectedPayment?.payment_method || '-'}</p>
              </div>
              {selectedPayment?.payment_reference && (
                <div>
                  <Label className="text-muted-foreground">Reference</Label>
                  <p>{selectedPayment.payment_reference}</p>
                </div>
              )}
              {selectedPayment?.notes && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Notes</Label>
                  <p>{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewingDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
);
}