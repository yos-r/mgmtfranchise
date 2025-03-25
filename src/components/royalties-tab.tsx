import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoyaltiesHeader } from "./royalties/royalties-header";
import { StatsCards } from "./royalties/stats-cards";
import { PaymentsTable } from "./royalties/payments-table";
import { PaymentDetailsDialog } from "./royalties/payment-details-dialog";
import { RecordPaymentDialog } from "./royalties/record-payment-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Receipt } from "lucide-react";

const mockPayments = [
  {
    id: 1,
    franchiseName: "CENTURY 21 Saint-Germain",
    companyName: "Saint-Germain Real Estate SARL",
    totalAmount: 4000,
    dueDate: new Date("2024-04-15"),
    status: "pending",
    reference: "PAY-2024-001",
  },
  {
    id: 2,
    franchiseName: "CENTURY 21 Confluence",
    companyName: "Confluence Immobilier SAS",
    totalAmount: 3500,
    dueDate: new Date("2024-04-10"),
    status: "paid",
    reference: "PAY-2024-002",
  },
];

export function RoyaltiesTab() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = {
    totalDue: 45000,
    pendingPayments: 12,
    latePayments: 3,
    collectionRate: 92,
  };

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch = payment.franchiseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
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

  const renderActionButton = (payment: any) => {
    if (payment.status === "pending") {
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
      />

      <StatsCards stats={stats} />

      <Card>
        <CardContent className="pt-6">
          <PaymentsTable
            payments={filteredPayments}
            onPaymentSelect={(payment) => {
              setSelectedPayment(payment);
              setDetailsDialogOpen(true);
            }}
            renderActionButton={renderActionButton}
            getStatusColor={getStatusColor}
          />
        </CardContent>
      </Card>

      {selectedPayment && (
        <>
          <PaymentDetailsDialog
            payment={selectedPayment}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
          <RecordPaymentDialog
            payment={selectedPayment}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
          />
        </>
      )}
    </div>
  );
}