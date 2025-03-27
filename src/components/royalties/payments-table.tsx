import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
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

interface PaymentsTableProps {
  payments: any[];
  onPaymentSelect: (payment: any) => void;
  renderActionButton: (payment: any) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

export function PaymentsTable({ 
  payments, 
  onPaymentSelect, 
  renderActionButton,
  getStatusColor 
}: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="label-1">
            <Button variant="ghost" className="button-2 -ml-4">
              Franchise
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="label-1">Amount</TableHead>
          <TableHead className="label-1">Due Date</TableHead>
          <TableHead className="label-1">Status</TableHead>
          <TableHead className="label-1 text-right pr-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments && payments.length > 0 ? (
          payments.map((payment) => (
            <TableRow 
              key={payment.id}
              className="cursor-pointer"
              onClick={() => onPaymentSelect(payment)}
            >
              <TableCell className="body-1 font-medium">
                {payment.franchises?.name || "Unknown"} <br />
                <span className="text-muted-foreground">{payment.franchises?.address || ""}</span>
              </TableCell>
              <TableCell className="numbers">
                €{payment.amount ? payment.amount.toLocaleString() : "0"}
              </TableCell>
              <TableCell className="body-1">
                {payment.due_date ? format(new Date(payment.due_date), 'MMM d, yyyy') : "-"}
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(payment.status || 'unknown')} label-2`}>
                  {payment.status || 'unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {renderActionButton(payment)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
              No payments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}