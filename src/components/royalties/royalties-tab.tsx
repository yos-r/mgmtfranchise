import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoyaltiesHeader } from "./royalties-header";
import { StatsCards } from "./stats-cards";
import { PaymentsTable } from "./payments-table";
import { PaymentDetailsDialog } from "./payment-details-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Receipt } from "lucide-react";
import { supabase } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export function RoyaltiesTab() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);
  const [payments, setPayments] = useState([]);
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

  // Apply filters to the payments data
  const filteredPayments = payments.filter((payment) => {
    // Apply status filter
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    // Apply search query filter
    const matchesSearch = searchQuery === "" || (
      payment.franchises && (
        payment.franchises.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.franchises.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    // Apply franchise filter
    const matchesFranchise = !selectedFranchiseId || payment.franchise_id === selectedFranchiseId;
    
    return matchesStatus && matchesSearch && matchesFranchise;
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

  const renderActionButton = (payment) => {
    if (payment.status === "upcoming" || payment.status === "pending" || payment.status === "late") {
      return (
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(payment);
            setPaymentDialogOpen(true);
          }}
          className="button-2"
        >
          <Receipt className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPayment(payment);
          setDetailsDialogOpen(true);
        }}
        className="button-2"
      >
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <RoyaltiesHeader
        onFilterChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onFranchiseSelect={setSelectedFranchiseId}
        currentFilter={statusFilter}
        currentSearch={searchQuery}
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
              onPaymentSelect={(payment) => {
                setSelectedPayment(payment);
                setDetailsDialogOpen(true);
              }}
              renderActionButton={renderActionButton}
              getStatusColor={getStatusColor}
              franchises={franchises}
              onFilterChange={setStatusFilter}
              onSearchChange={setSearchQuery}
              onFranchiseSelect={setSelectedFranchiseId}
              currentFilter={statusFilter}
              currentSearch={searchQuery}
              selectedFranchise={selectedFranchiseId}
              onBatchUpdate={handleBatchUpdate}
            />
          )}
        </CardContent>
      </Card>

      {selectedPayment && (
        <>
          <PaymentDetailsDialog
            payment={selectedPayment}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            onPaymentRecorded={loadAllPayments}
          />
          <RecordPaymentDialog
            payment={selectedPayment}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onPaymentRecorded={loadAllPayments}
          />
        </>
      )}
    </div>
  );
}