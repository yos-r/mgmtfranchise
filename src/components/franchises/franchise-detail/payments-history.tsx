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
import { Euro, Plus, Receipt, Eye, Edit, MoreHorizontal, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";
import { RecordPaymentDialog } from './record-payment-dialog';
import { EditPaymentDialog } from './edit-payment-dialog';
import { PaymentLogsDialog } from './payment-logs-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PaymentsHistory({ franchise }: any) {
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<Record<string, number>>({});
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isViewingLogs, setIsViewingLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPayments, setPaginatedPayments] = useState<any[]>([]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Load payments
      const { data, error } = await supabase
        .from('royalty_payments')
        .select('*,franchises(*)')
        .eq('franchise_id', franchise.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setPayments(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        console.log('payments are', data);
        
        // Get payment IDs for log count query
        const paymentIds = data.map(payment => payment.id);
        
        // Get log counts for each payment
        if (paymentIds.length > 0) {
          // Get all logs for these payments
          const { data: logsData, error: logsError } = await supabase
            .from('payment_logs')
            .select('payment_id')
            .in('payment_id', paymentIds);
          
          if (logsError) throw logsError;
          
          // Count logs for each payment ID
          const logsMap: Record<string, number> = {};
          
          if (logsData && logsData.length > 0) {
            // Count occurrences of each payment_id
            logsData.forEach(log => {
              if (logsMap[log.payment_id]) {
                logsMap[log.payment_id]++;
              } else {
                logsMap[log.payment_id] = 1;
              }
            });
          }
          
          setPaymentLogs(logsMap);
        }
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      
    // Also listen for payment_logs changes
    const logsChannel = supabase
      .channel('payment_logs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_logs'
      }, () => {
        console.log("Payment logs updated, reloading...");
        loadPayments();
      }).subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(logsChannel);
    }
  }, [franchise.id]);

  // Update paginated data when payments or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedPayments(payments.slice(startIndex, endIndex));
  }, [payments, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
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

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsViewingDetails(true);
  };

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsEditingPayment(true);
  };

  const handleRecordPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsRecordingPayment(true);
  };

  const handleViewLogs = (payment: any) => {
    setSelectedPayment(payment);
    setIsViewingLogs(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setTotalPages(Math.ceil(payments.length / newItemsPerPage));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const hasLogs = (paymentId: string) => {
    return paymentLogs[paymentId] && paymentLogs[paymentId] > 0;
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
          <>
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
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {payment.period || format(new Date(payment.due_date), 'MMM yyyy')}
                        {hasLogs(payment.id) && (
                          <Badge 
                            variant="outline" 
                            className="ml-2 cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLogs(payment);
                            }}
                          >
                            <History className="h-3 w-3 mr-1" />
                            {paymentLogs[payment.id]}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right ">
                      {payment.status!= 'grace' && <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {hasLogs(payment.id) && (
                            <DropdownMenuItem onClick={() => handleViewLogs(payment)}>
                              <History className="mr-2 h-4 w-4" />
                              View History Logs
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Payment
                          </DropdownMenuItem>
                          {(payment.status === 'pending' || payment.status === 'upcoming' || 
                            payment.status === 'late' ) && (
                            <DropdownMenuItem onClick={() => handleRecordPayment(payment)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>}
                      
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls - Simplified Style */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Record Payment Dialog - Now using the separate component */}
        <RecordPaymentDialog
          open={isRecordingPayment}
          onOpenChange={setIsRecordingPayment}
          payment={selectedPayment}
          onSuccess={loadPayments}
        />

        {/* Edit Payment Dialog */}
        <EditPaymentDialog
          open={isEditingPayment}
          onOpenChange={setIsEditingPayment}
          payment={selectedPayment}
          onSuccess={loadPayments}
        />

        {/* Payment Logs Dialog */}
        <PaymentLogsDialog
          open={isViewingLogs}
          onOpenChange={setIsViewingLogs}
          paymentId={selectedPayment?.id}
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
                  <p className="flex items-center">
                    {selectedPayment?.status && getStatusBadge(selectedPayment.status)}
                    {hasLogs(selectedPayment?.id) && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 cursor-pointer" 
                        onClick={() => handleViewLogs(selectedPayment)}
                      >
                        <History className="h-3 w-3 mr-1" />
                        View History
                      </Badge>
                    )}
                  </p>
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
              {hasLogs(selectedPayment?.id) && (
                <Button variant="outline" onClick={() => handleViewLogs(selectedPayment)}>
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              )}
              <Button variant="outline" onClick={() => handleEditPayment(selectedPayment)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
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