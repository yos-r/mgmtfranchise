import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowUpDown, ChevronsUpDown, Filter, Calendar } from "lucide-react";
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
  onFranchiseSelect?: (franchiseId: string | null) => void;
  onYearChange?: (year: string | null) => void;
  onMonthChange?: (month: string | null) => void;
  currentFilter?: string;
  selectedFranchise?: string | null;
  selectedYear?: string | null;
  selectedMonth?: string | null;
  onBatchUpdate?: (paymentIds: string[], updateData: any) => void;
}

export function PaymentsTable({
  payments,
  onPaymentSelect,
  renderActionButton,
  getStatusColor,
  franchises = [],
  onFilterChange = () => {},
  onFranchiseSelect,
  onYearChange = () => {},
  onMonthChange = () => {},
  currentFilter = "all",
  selectedFranchise = null,
  selectedYear = null,
  selectedMonth = null,
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
  
  // Get available years and months from payments data
  const getAvailableYears = () => {
    if (!payments || payments.length === 0) return [];
    
    try {
      const years = new Set<string>();
      
      payments.forEach(payment => {
        if (payment.due_date) {
          try {
            const date = new Date(payment.due_date);
            // Check if date is valid
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear().toString();
              years.add(year);
            }
          } catch (e) {
            console.error("Error parsing date:", payment.due_date, e);
          }
        }
      });
      
      return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
    } catch (error) {
      console.error("Error getting available years:", error);
      return [];
    }
  };
  
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Update pagination when payments change
  useEffect(() => {
    if (!payments) return;
    
    try {
      setTotalPages(Math.ceil(payments.length / itemsPerPage) || 1); // Ensure at least 1 page
      
      // Reset to first page when filters change total count
      if (currentPage > Math.ceil(payments.length / itemsPerPage)) {
        setCurrentPage(1);
      }
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedPayments(payments.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Error updating pagination:", error);
      setPaginatedPayments([]);
      setTotalPages(1);
    }
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
        if (payment && payment.id) {
          newSelected.add(payment.id);
        }
      });
      setSelectedPayments(newSelected);
    }
  };

  const handleSelect = (id: string) => {
    if (!id) return;
    
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
      // If clicked on the already selected franchise or "all", deselect
      if (franchiseId === "all_franchises" || franchiseId === selectedFranchise) {
        onFranchiseSelect(null);
      } else {
        onFranchiseSelect(franchiseId);
      }
    }
    setPopoverOpen(false);
  };
  
  const handleYearChange = (year: string | null) => {
    console.log('year changed!',year)
    if (onYearChange) {
      onYearChange(year);
    }
    
    // Reset month when year changes
    if (selectedMonth && year !== selectedYear) {
      if (onMonthChange) {
        onMonthChange(null);
      }
    }
  };

  const selectedFranchiseName = franchises.find(f => f.id === selectedFranchise)?.name || "All Franchises";
  const availableYears = getAvailableYears();

  // Debug
  useEffect(() => {
    console.log("Selected year:", selectedYear);
    console.log("Selected month:", selectedMonth);
    console.log("Available years:", availableYears);
  }, [selectedYear, selectedMonth, availableYears]);

  return (
    <div className="space-y-4">
      {/* Filters Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {/* Franchise Selection Dropdown with Search */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-[180px] md:w-[220px] justify-between"
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
                      key="all_franchises"
                      value="all_franchises"
                      onSelect={() => handleFranchiseSelect("all_franchises")}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        !selectedFranchise ? "font-medium" : ""
                      )}
                    >
                      All Franchises
                    </CommandItem>
                    {franchises
                      .filter(franchise => 
                        franchise.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
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
                          <div>{franchise.name || "Unnamed"}</div>
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
            <SelectTrigger className="w-[140px] md:w-[160px]">
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

        {/* Date Filters */}
        <div className="flex items-center space-x-2">
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <Select 
              value={selectedYear || "all_years"}
              onValueChange={(value) => handleYearChange(value === "all_years" ? null : value)}
            >
              <SelectTrigger className="w-[110px] md:w-[120px]">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_years">All Years</SelectItem>
                {availableYears && availableYears.length > 0 ? (
                  availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_years" disabled>No years available</SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Month Filter - Only enable if year is selected */}
            <Select 
              value={selectedMonth || "all_months"}
              onValueChange={(value) => onMonthChange(value === "all_months" ? null : value)}
              // disabled={!selectedYear}
            >
              <SelectTrigger className="w-[120px] md:w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear Filters Button - Show only when filters are active */}
          {(selectedYear || selectedMonth || selectedFranchise || currentFilter !== "all") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                onYearChange(null);
                onMonthChange(null);
                if (onFranchiseSelect) onFranchiseSelect(null);
                onFilterChange("all");
              }}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Selected Filters Display */}
      {(selectedYear || selectedMonth || selectedFranchise || currentFilter !== "all") && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Filtered by:</span>
          {selectedFranchise && (
            <Badge variant="outline" className="flex items-center gap-1">
              Franchise: {selectedFranchiseName}
            </Badge>
          )}
          {currentFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {currentFilter}
            </Badge>
          )}
          {selectedYear && (
            <Badge variant="outline" className="flex items-center gap-1">
              Year: {selectedYear}
            </Badge>
          )}
          {selectedMonth && (
            <Badge variant="outline" className="flex items-center gap-1">
              Month: {months.find(m => m.value === selectedMonth)?.label}
            </Badge>
          )}
        </div>
      )}

      {/* Payments Table */}
      <div className="overflow-x-auto">
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
                      checked={payment.id && selectedPayments.has(payment.id)}
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
                    {payment.due_date ? (
                      (() => {
                        try {
                          const date = new Date(payment.due_date);
                          return !isNaN(date.getTime()) 
                            ? format(date, 'MMM d, yyyy') 
                            : "-";
                        } catch (e) {
                          console.error("Error formatting date:", payment.due_date);
                          return "-";
                        }
                      })()
                    ) : "-"}
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
                  No payments found matching the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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