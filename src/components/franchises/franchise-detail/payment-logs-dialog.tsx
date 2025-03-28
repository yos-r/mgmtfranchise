import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Euro, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function PaymentLogsDialog({ open, onOpenChange, paymentId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (paymentId && open) {
      loadPaymentLogs();
    }
  }, [paymentId, open]);

  const loadPaymentLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading payment logs:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Payment History Logs</DialogTitle>
          <DialogDescription>
            Viewing historical changes for this payment record
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-4">Loading payment logs...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No historical logs found for this payment</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span>{log.amount?.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.payment_method || '-'}</TableCell>
                    <TableCell>
                      {log.payment_date
                        ? format(new Date(log.payment_date), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}