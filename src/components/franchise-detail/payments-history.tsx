import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentsTable } from "../royalties/payments-table";
import { PaymentDetailsDialog } from "../royalties/payment-details-dialog";
import { RecordPaymentDialog } from "../royalties/record-payment-dialog";
import { useState } from "react";
import { Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentsHistory() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

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
      franchiseName: "CENTURY 21 Saint-Germain",
      companyName: "Saint-Germain Real Estate SARL",
      totalAmount: 3500,
      dueDate: new Date("2024-03-15"),
      status: "paid",
      reference: "PAY-2024-002",
    },
  ];

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
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentsTable
          payments={mockPayments}
          onPaymentSelect={(payment) => {
            setSelectedPayment(payment);
            setDetailsDialogOpen(true);
          }}
          renderActionButton={renderActionButton}
          getStatusColor={getStatusColor}
        />

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
      </CardContent>
    </Card>
  );
}