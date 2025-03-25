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

interface RoyaltiesHeaderProps {
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function RoyaltiesHeader({ onFilterChange, onSearchChange }: RoyaltiesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="tagline-1">Royalty Payments</h2>
        <p className="body-lead text-muted-foreground">
          Manage and track franchise royalty payments
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Select onValueChange={onFilterChange}>
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
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button className="button-1">
          <Receipt className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>
    </div>
  );
}