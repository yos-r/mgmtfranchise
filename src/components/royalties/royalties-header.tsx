import { Receipt, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordPaymentDialogSelect } from "./record-payment-dialog-select";
import { useState } from "react";

// interface RoyaltiesHeaderProps {
//   onFilterChange: (value: string) => void;
//   onSearchChange: (value: string) => void;
// }

export function RoyaltiesHeader() {
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  return (
    
    <div className="flex items-center justify-between">
      <div>
        <h2 className="tagline-1">Royalty Payments</h2>
        <p className="body-lead text-muted-foreground">
          Manage and track franchise royalty payments
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Select >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search franchises..."
          className="w-[200px]"
          
        />
        {/* <Button className="button-1" onClick={(e) => {
          e.stopPropagation();
          setPaymentDialogOpen(true);
        }}>
          <Receipt className="mr-2 h-4 w-4" />
          Record Payment
        </Button> */}

        <RecordPaymentDialogSelect open={paymentDialogOpen}  onOpenChange={setPaymentDialogOpen}></RecordPaymentDialogSelect>
      </div>
    </div>
  );
}