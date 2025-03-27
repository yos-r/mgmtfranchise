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
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    collectionRate: 0,
  });

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('royalty_payments')
        .select('*, franchises(*)')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setPayments(data);
        
        // Calculate stats from actual data
        const totalDue = data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
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

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch = payment.franchises && (
      payment.franchises.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.franchises.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesStatus && (searchQuery === "" || matchesSearch);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "late":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderActionButton = (payment) => {
    if (payment.status === "upcoming" || payment.status === "pending") {
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
        currentFilter={statusFilter}
        currentSearch={searchQuery}
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