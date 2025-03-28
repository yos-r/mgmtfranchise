import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoyaltiesHeader } from "./royalties-header";
import { StatsCards } from "./stats-cards";
import { PaymentsTable } from "./payments-table";
import { PaymentDetailsDialog } from "./payment-details-dialog";
import { RecordPaymentDialog } from "../franchises/franchise-detail/record-payment-dialog";
import { EditPaymentDialog } from "../franchises/franchise-detail/edit-payment-dialog";
import { PaymentLogsDialog } from "../franchises/franchise-detail/payment-logs-dialog"
import { supabase } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export function RoyaltiesTab() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentLogs, setPaymentLogs] = useState({});
  const [franchises, setFranchises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFranchises, setIsLoadingFranchises] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    collectionRate: 0,
  });

  const loadFranchises = async () => {
    setIsLoadingFranchises(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name, address')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setFranchises(data);
      }
    } catch (error) {
      console.error('Error loading franchises:', error);
    } finally {
      setIsLoadingFranchises(false);
    }
  };

  // Load ALL payments for stats and filtering
  const loadAllPayments = async () => {
    setIsLoading(true);
    try {
      // Load payments
      const { data, error } = await supabase
        .from('royalty_payments')
        .select('*, franchises(*)')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setPayments(data);
        
        // Apply franchise filter for stats calculation
        let statsData = data;
        if (selectedFranchiseId) {
          statsData = data.filter(payment => payment.franchise_id === selectedFranchiseId);
        }
        
        calculateStats(statsData);
        
        // Get payment IDs for log count query
        const paymentIds = data.map(payment => payment.id);
        
        // Get log counts for each payment
        if (paymentIds.length > 0) {
          try {
            // Get all logs for these payments
            const { data: logsData, error: logsError } = await supabase
              .from('payment_logs')
              .select('payment_id')
              .in('payment_id', paymentIds);
            
            if (logsError) throw logsError;
            
            // Count logs for each payment ID
            const logsMap = {};
            
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
          } catch (logsErr) {
            console.error("Error loading payment logs:", logsErr);
          }
        }
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats based on the provided data
  const calculateStats = (data) => {
    // Get current date and next month's date for calculations
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Get current month and year for collection rate calculation
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Total due: sum amounts of unpaid payments that are due before next month
    const totalDue = data.reduce((sum, payment) => {
      const dueDate = new Date(payment.due_date);
      // Include if payment is not paid and due before next month
      if (payment.status !== 'paid' && payment.status !== 'grace' && dueDate < nextMonth) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
    
    // Pending payments: count unpaid payments that are due before next month
    const pendingCount = data.filter(payment => {
      const dueDate = new Date(payment.due_date);
      return payment.status === 'upcoming' && dueDate < nextMonth;
    }).length;
    
    // Late payments: count payments with 'late' status
    const lateCount = data.filter(p => p.status === 'late').length;
    
    // Collection rate: paid royalties divided by due royalties for the current month
    // Filter payments for current month
    const currentMonthPayments = data.filter(payment => {
      const dueDate = new Date(payment.due_date);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    });
    
    // Count paid and total due payments for current month
    const paidCurrentMonth = currentMonthPayments.filter(p => p.status === 'paid').length;
    const totalCurrentMonth = currentMonthPayments.length;
    
    const collectionRate = totalCurrentMonth > 0 
      ? Math.round((paidCurrentMonth / totalCurrentMonth) * 100) 
      : 0;
    
    setStats({
      totalDue,
      pendingPayments: pendingCount,
      latePayments: lateCount,
      collectionRate,
    });
  };

  // Handle batch updates
  const handleBatchUpdate = async (paymentIds, updateData) => {
    try {
      const { data, error } = await supabase
        .from('royalty_payments')
        .update(updateData)
        .in('id', paymentIds);
      
      if (error) throw error;
      
      // Reload data after update
      loadAllPayments();
      
      // Show success message
      toast({
        title: "Success",
        description: `${paymentIds.length} payments marked as paid`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating payments:', error);
      toast({
        title: "Error",
        description: "Failed to update payments",
        variant: "destructive"
      });
    }
  };

  // Load franchises on initial render
  useEffect(() => {
    loadFranchises();
  }, []);

  // Load payments when franchise selection changes
  useEffect(() => {
    loadAllPayments();
  }, [selectedFranchiseId]);

  // Handle year filter change
  const handleYearChange = (year) => {
    setSelectedYear(year);
    // If changing year, reset month selection to avoid invalid combinations
    if (year !== selectedYear) {
      setSelectedMonth(null);
    }
  };

  // Handle month filter change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Handle payment actions
  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleRecordPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditDialogOpen(true);
  };

  const handleViewLogs = (payment) => {
    setSelectedPayment(payment);
    setLogsDialogOpen(true);
  };

  // Check if payment has logs
  const hasLogs = (paymentId) => {
    return paymentLogs[paymentId] && paymentLogs[paymentId] > 0;
  };

  // Apply filters to the payments data
  const filteredPayments = payments.filter((payment) => {
    // Apply status filter
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    // Apply franchise filter
    const matchesFranchise = !selectedFranchiseId || payment.franchise_id === selectedFranchiseId;
    
    // Apply year and month filters
    let matchesDate = true;
    if (payment.due_date) {
      const dueDate = new Date(payment.due_date);
      
      // Only apply if valid date
      if (!isNaN(dueDate.getTime())) {
        // Check year filter
        if (selectedYear) {
          const paymentYear = dueDate.getFullYear().toString();
          matchesDate = paymentYear === selectedYear;
        }
        
        // Check month filter (only if year matches)
        if (matchesDate && selectedMonth) {
          const paymentMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
          matchesDate = paymentMonth === selectedMonth;
        }
      }
    }
    
    return matchesStatus && matchesFranchise && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "late":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <RoyaltiesHeader
        onFilterChange={setStatusFilter}
        onFranchiseSelect={setSelectedFranchiseId}
        currentFilter={statusFilter}
        franchises={franchises}
        selectedFranchise={selectedFranchiseId}
      />

      <StatsCards stats={stats} isLoading={isLoading} />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : (
            <PaymentsTable
              payments={filteredPayments}
              paymentLogs={paymentLogs}
              onPaymentSelect={handleViewPaymentDetails}
              onRecordPayment={handleRecordPayment}
              onEditPayment={handleEditPayment}
              onViewLogs={handleViewLogs}
              getStatusColor={getStatusColor}
              franchises={franchises}
              onFilterChange={setStatusFilter}
              onFranchiseSelect={setSelectedFranchiseId}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              currentFilter={statusFilter}
              selectedFranchise={selectedFranchiseId}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onBatchUpdate={handleBatchUpdate}
              showFranchiseColumn={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedPayment && (
        <>
          <PaymentDetailsDialog
            payment={selectedPayment}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            onEditPayment={handleEditPayment}
            onRecordPayment={handleRecordPayment}
            onViewLogs={handleViewLogs}
            hasLogs={hasLogs}
            showFranchiseDetails={true}
          />
          
          <RecordPaymentDialog
            payment={selectedPayment}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onSuccess={loadAllPayments}
          />
          
          <EditPaymentDialog
            payment={selectedPayment}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={loadAllPayments}
          />
          
          <PaymentLogsDialog
            paymentId={selectedPayment.id}
            open={logsDialogOpen}
            onOpenChange={setLogsDialogOpen}
          />
        </>
      )}
    </div>
  );
}