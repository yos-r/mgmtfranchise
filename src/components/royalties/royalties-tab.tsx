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

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('royalty_payments')
        .select('*, franchises(*)')
        .order('due_date', { ascending: true });
      
      // Apply franchise filter if selected
      if (selectedFranchiseId) {
        query = query.eq('franchise_id', selectedFranchiseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setPayments(data);
        
        // Calculate stats from filtered data
        const totalDue = data.reduce((sum, payment) => 
          sum + (payment.status !== 'paid' ? (payment.amount || 0) : 0), 0);
        const pendingCount = data.filter(p => p.status === 'pending').length;
        const lateCount = data.filter(p => p.status === 'late').length;
        const paidCount = data.filter(p => p.status === 'paid').length;
        const collectionRate = data.length > 0 
          ? Math.round((paidCount / data.length) * 100) 
          : 0;
        
        setStats({
          totalDue,
          pendingPayments: pendingCount,
          latePayments: lateCount,
          collectionRate,
        });
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load franchises on initial render
  useEffect(() => {
    loadFranchises();
  }, []);

  // Load payments when filters change
  useEffect(() => {
    loadPayments();
  }, [selectedFranchiseId]);

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch = searchQuery === "" || (
      payment.franchises && (
        payment.franchises.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.franchises.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    return matchesStatus && matchesSearch;
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
            onPaymentRecorded={loadPayments}
          />
          <RecordPaymentDialog
            payment={selectedPayment}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onPaymentRecorded={loadPayments}
          />
        </>
      )}
    </div>
  );
}