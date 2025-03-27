import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowUpDown, Search, X, ChevronsUpDown, Filter } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PaymentsTableProps {
  payments: any[];
  onPaymentSelect: (payment: any) => void;
  renderActionButton: (payment: any) => React.ReactNode;
  getStatusColor: (status: string) => string;
  franchises?: any[];
  onFilterChange?: (value: string) => void;
  onSearchChange?: (value: string) => void;
  onFranchiseSelect?: (franchiseId: string | null) => void;
  currentFilter?: string;
  currentSearch?: string;
  selectedFranchise?: string | null;
  onBatchUpdate?: (paymentIds: string[], updateData: any) => void;
}

export function PaymentsTable({
  payments,
  onPaymentSelect,
  renderActionButton,
  getStatusColor,
  franchises = [],
  onFilterChange = () => {},
  onSearchChange = () => {},
  onFranchiseSelect,
  currentFilter = "all",
  currentSearch = "",
  selectedFranchise = null,
  onBatchUpdate = () => {},
}: PaymentsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPayments, setPaginatedPayments] = useState<any[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [batchActionDialogOpen, setBatchActionDialogOpen] = useState(false);

  // Update pagination when payments change
  useEffect(() => {
    if (!payments) return;
    
    setTotalPages(Math.ceil(payments.length / itemsPerPage));
    
    // Reset to first page when filters change total count
    if (currentPage > Math.ceil(payments.length / itemsPerPage)) {
      setCurrentPage(1);
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedPayments(payments.slice(startIndex, endIndex));
  }, [payments, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = () => {
    if (selectedPayments.size === paginatedPayments.length) {
      // Deselect all if all are selected
      setSelectedPayments(new Set());
    } else {
      // Select all current page items
      const newSelected = new Set(selectedPayments);
      paginatedPayments.forEach(payment => {
        newSelected.add(payment.id);
      });
      setSelectedPayments(newSelected);
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedPayments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPayments(newSelected);
  };

  const handleFranchiseSelect = (franchiseId: string) => {
    if (onFranchiseSelect) {
      onFranchiseSelect(franchiseId === selectedFranchise ? null : franchiseId);
    }
    setPopoverOpen(false);
  };

  const selectedFranchiseName = franchises.find(f => f.id === selectedFranchise)?.name || "All Franchises";

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Franchise Selection Dropdown with Search */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-[220px] justify-between"
              >
                <span className="truncate">{selectedFranchiseName}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search franchises..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No franchise found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      value="all"
                      onSelect={() => handleFranchiseSelect("")}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        !selectedFranchise ? "font-medium" : ""
                      )}
                    >
                      All Franchises
                    </CommandItem>
                    {franchises
                      .filter(franchise => 
                        franchise.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                        (franchise.address && franchise.address.toLowerCase().includes(searchValue.toLowerCase()))
                      )
                      .map(franchise => (
                        <CommandItem
                          key={franchise.id}
                          value={franchise.id}
                          onSelect={() => handleFranchiseSelect(franchise.id)}
                          className={cn(
                            "flex flex-col items-start gap-1 text-sm",
                            selectedFranchise === franchise.id ? "font-medium" : ""
                          )}
                        >
                          <div>{franchise.name}</div>
                          {franchise.address && (
                            <div className="text-xs text-muted-foreground">{franchise.address}</div>
                          )}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select 
            value={currentFilter}
            onValueChange={(value) => onFilterChange(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative w-[250px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-8"
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {currentSearch && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={paginatedPayments.length > 0 && selectedPayments.size === paginatedPayments.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
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
          {paginatedPayments && paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment) => (
              <TableRow
                key={payment.id}
                className="cursor-pointer"
                onClick={() => onPaymentSelect(payment)}
              >
                <TableCell className="w-[50px]" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedPayments.has(payment.id)}
                    onCheckedChange={() => handleSelect(payment.id)}
                    aria-label={`Select payment for ${payment.franchises?.name}`}
                  />
                </TableCell>
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {renderActionButton(payment)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No payments found
              </TableCell>
            </TableRow>
          )}
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
          
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          
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
    </div>
  );
}