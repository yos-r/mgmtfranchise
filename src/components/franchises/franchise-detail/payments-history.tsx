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
import { Plus, Receipt, Eye, Edit, MoreHorizontal, History, Calendar, Filter, Banknote } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from '@/hooks/useCurrency';
export function PaymentsHistory({ franchise }: any) {
  const { formatCurrency } = useCurrency();
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

  // Filtering state
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

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

        // Extract available years for filtering
        const years = new Set<string>();
        data.forEach(payment => {
          if (payment.due_date) {
            try {
              const date = new Date(payment.due_date);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear().toString();
                years.add(year);
              }
            } catch (e) {
              console.error("Error parsing date:", payment.due_date, e);
            }
          }
        });
        setAvailableYears(Array.from(years).sort((a, b) => b.localeCompare(a))); // Sort descending

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

  // Apply filters when they change
  useEffect(() => {
    // Apply year, month, and status filters
    const filtered = payments.filter(payment => {
      // Apply status filter
      if (selectedStatus !== "all" && payment.status !== selectedStatus) {
        return false;
      }

      if (!payment.due_date) return true;

      try {
        const dueDate = new Date(payment.due_date);

        // Skip invalid dates
        if (isNaN(dueDate.getTime())) return true;

        // Apply year filter
        if (selectedYear) {
          const paymentYear = dueDate.getFullYear().toString();
          if (paymentYear !== selectedYear) return false;
        }

        // Apply month filter (only if year matches)
        if (selectedMonth) {
          const paymentMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
          if (paymentMonth !== selectedMonth) return false;
        }

        return true;
      } catch (e) {
        console.error("Error filtering by date:", e);
        return true;
      }
    });

    setFilteredPayments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [payments, selectedYear, selectedMonth, selectedStatus, itemsPerPage]);

  // Update paginated data when filtered payments or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedPayments(filteredPayments.slice(startIndex, endIndex));
  }, [filteredPayments, currentPage, itemsPerPage]);

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
        return <Badge className="bg-blue-100 text-blue-800">Grace</Badge>;
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

  const handleYearChange = (year: string | null) => {
    setSelectedYear(year);
    // Reset month when year changes
    if (year !== selectedYear) {
      setSelectedMonth(null);
    }
  };

  const handleMonthChange = (month: string | null) => {
    setSelectedMonth(month);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedStatus("all");
  };

  const hasLogs = (paymentId: string) => {
    return paymentLogs[paymentId] && paymentLogs[paymentId] > 0;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Royalty Payments History</CardTitle>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[120px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="grace">Grace Period</SelectItem>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select
            value={selectedYear || "all_years"}
            onValueChange={(value) => handleYearChange(value === "all_years" ? null : value)}
          >
            <SelectTrigger className="w-[100px]">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_years">All Years</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month Filter - Only enable if year is selected */}
          <Select
            value={selectedMonth || "all_months"}
            onValueChange={(value) => handleMonthChange(value === "all_months" ? null : value)}
            disabled={!selectedYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_months">All Months</SelectItem>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button - Show only when filters are active */}
          {(selectedYear || selectedMonth || selectedStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Indicators */}
        {(selectedYear || selectedMonth || selectedStatus !== "all") && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Filtered by:</span>
            {selectedStatus !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="outline" className="flex items-center gap-1">
                Year: {selectedYear}
              </Badge>
            )}
            {selectedMonth && (
              <Badge variant="outline" className="flex items-center gap-1">
                Month: {months.find(m => m.value === selectedMonth)?.label}
              </Badge>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading payment history...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {payments.length === 0
                ? "No payment records found for this franchise"
                : "No payments match the selected filters"}
            </p>
            {payments.length > 0 && (selectedYear || selectedMonth || selectedStatus !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
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
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCurrency(payment.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCurrency(payment.royalty_amount)} </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCurrency(payment.marketing_amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(payment.due_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {payment.payment_date
                        ? format(new Date(payment.payment_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>{payment.payment_method || '-'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right ">
                      {payment.status != 'grace' && <DropdownMenu>
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
                            payment.status === 'late') && (
                              <DropdownMenuItem onClick={() => handleRecordPayment(payment)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>}
                      {payment.status == 'grace' && (

                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                      )}

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
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

                {(() => {
                  // Calculate which page numbers to display (max 6)
                  const getPageNumbers = () => {
                    // For 6 or fewer pages, show all page numbers
                    if (totalPages <= 6) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }

                    // For more than 6 pages, show a window of pages around the current page
                    let startPage = Math.max(currentPage - 2, 1);
                    let endPage = Math.min(startPage + 4, totalPages);

                    // Adjust start if we're near the end
                    if (endPage === totalPages) {
                      startPage = Math.max(endPage - 4, 1);
                    }

                    const pages = [];

                    // Always show first page
                    if (startPage > 1) {
                      pages.push(1);
                      // Add ellipsis if there's a gap
                      if (startPage > 2) {
                        pages.push('ellipsis-start');
                      }
                    }

                    // Add pages in the calculated range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    // Always show last page
                    if (endPage < totalPages) {
                      // Add ellipsis if there's a gap
                      if (endPage < totalPages - 1) {
                        pages.push('ellipsis-end');
                      }
                      pages.push(totalPages);
                    }

                    return pages;
                  };

                  const pageNumbers = getPageNumbers();

                  return pageNumbers.map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <div
                          key={`ellipsis-${index}`}
                          className="flex items-center justify-center h-8 w-8"
                        >
                          <span className="text-gray-400">...</span>
                        </div>
                      );
                    }

                    return (
                      <Button
                        key={`page-${page}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  });
                })()}

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
                {selectedPayment?.period || (selectedPayment?.due_date && format(new Date(selectedPayment.due_date), 'dd/MM/yyyy'))}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-lg font-medium">
                    {formatCurrency(selectedPayment?.amount || 0)}
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
                  <p>{selectedPayment?.due_date && format(new Date(selectedPayment.due_date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Date</Label>
                  <p>{selectedPayment?.payment_date
                    ? format(new Date(selectedPayment.payment_date), 'dd/MM/yyyy')
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