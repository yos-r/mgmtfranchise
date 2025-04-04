import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowUpDown, ChevronsUpDown, Filter, Calendar, Eye, Edit, Receipt, MoreHorizontal, History } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PaymentsTableProps {
  payments: any[];
  paymentLogs?: Record<string, number>; // Log counts for payments
  onPaymentSelect: (payment: any) => void;
  onRecordPayment?: (payment: any) => void;
  onEditPayment?: (payment: any) => void;
  onViewLogs?: (payment: any) => void;
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
  showFranchiseColumn?: boolean; // Whether to show franchise column (hide for single franchise view)
}

export function PaymentsTable({
  payments,
  paymentLogs = {},
  onPaymentSelect,
  onRecordPayment,
  onEditPayment,
  onViewLogs,
  getStatusColor,
  franchises = [],
  onFilterChange = () => { },
  onFranchiseSelect,
  onYearChange = () => { },
  onMonthChange = () => { },
  currentFilter = "all",
  selectedFranchise = null,
  selectedYear = null,
  selectedMonth = null,
  onBatchUpdate = () => { },
  showFranchiseColumn = true
}: PaymentsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPayments, setPaginatedPayments] = useState<any[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

  // Helper to check if payment has logs
  const hasLogs = (paymentId: string) => {
    return paymentLogs[paymentId] && paymentLogs[paymentId] > 0;
  };

  const selectedFranchiseName = franchises.find(f => f.id === selectedFranchise)?.name || "All Franchises";
  const availableYears = getAvailableYears();

  return (
    <div className="space-y-4">
      {/* Filters Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {/* Franchise Selection Dropdown with Search - Only show if in network view */}
          {showFranchiseColumn && onFranchiseSelect && (
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
          )}

          {/* Status Filter */}
          <Select
            value={currentFilter}
            onValueChange={(value) => onFilterChange(value)}
          >
            <SelectTrigger className="w-[140px] md:w-[160px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="grace">Grace Period</SelectItem>
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
              disabled={!selectedYear}
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
              Status: {currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}
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
              {/* <TableHead className="w-[50px]">
                <Checkbox 
                  checked={paginatedPayments.length > 0 && selectedPayments.size === paginatedPayments.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead> */}
              {showFranchiseColumn && (
                <TableHead className="label-1">
                  <Button variant="ghost" className="button-2 -ml-4">
                    Franchise
                    {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                  </Button>
                </TableHead>
              )}
              <TableHead className="label-1">Period</TableHead>
              <TableHead className="label-1">Amount</TableHead>
              <TableHead className="label-1">Due Date</TableHead>
              <TableHead className="label-1">Payment Date</TableHead>
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
                  {/* <TableCell className="w-[50px]" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={payment.id && selectedPayments.has(payment.id)}
                      onCheckedChange={() => handleSelect(payment.id)}
                      aria-label={`Select payment for ${payment.franchises?.name}`}
                    />
                  </TableCell> */}
                  {showFranchiseColumn && (
                    <TableCell className="body-1 font-medium">
                      {payment.franchises?.name || "Unknown"} <br />
                      <span className="text-muted-foreground">{payment.franchises?.address || ""}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center">
                      {payment.period || (payment.due_date && format(new Date(payment.due_date), 'MMM yyyy'))}
                      {hasLogs(payment.id) && onViewLogs && (
                        <Badge
                          variant="outline"
                          className="ml-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewLogs(payment);
                          }}
                        >
                          <History className="h-3 w-3 mr-1" />
                          {paymentLogs[payment.id]}
                        </Badge>
                      )}
                    </div>
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
                    {payment.payment_date ? (
                      (() => {
                        try {
                          const date = new Date(payment.payment_date);
                          return !isNaN(date.getTime())
                            ? format(date, 'MMM d, yyyy')
                            : "-";
                        } catch (e) {
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
                  <TableCell className="text-right py-" onClick={(e) => e.stopPropagation()}>
                    {payment.status !== 'grace' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onPaymentSelect(payment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {hasLogs(payment.id) && onViewLogs && (
                            <DropdownMenuItem onClick={() => onViewLogs(payment)}>
                              <History className="mr-2 h-4 w-4" />
                              View History Logs
                            </DropdownMenuItem>
                          )}
                          {onEditPayment && (
                            <DropdownMenuItem onClick={() => onEditPayment(payment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Payment
                            </DropdownMenuItem>
                          )}
                          {onRecordPayment && (payment.status === 'pending' || payment.status === 'upcoming' || payment.status === 'late') && (
                            <DropdownMenuItem onClick={() => onRecordPayment(payment)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {payment.status == 'grace' && (

                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                    )}

                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showFranchiseColumn ? 8 : 7} className="text-center py-6 text-muted-foreground">
                  No payments found matching the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
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

          {(() => {
            // Calculate which page numbers to display (max 6)
            const getPageNumbers = () => {
              // For 6 or fewer pages, show all page numbers
              if (totalPages <= 6) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
              }

              // For more than 6 pages, show a window of pages around the current page
              let startPage = Math.max(currentPage - 2, 1);
              let endPage = Math.min(startPage + 4, totalPages);

              // Adjust start if we're near the end
              if (endPage === totalPages) {
                startPage = Math.max(endPage - 4, 1);
              }

              const pages = [];

              // Always show first page
              if (startPage > 1) {
                pages.push(1);
                // Add ellipsis if there's a gap
                if (startPage > 2) {
                  pages.push('ellipsis-start');
                }
              }

              // Add pages in the calculated range
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              // Always show last page
              if (endPage < totalPages) {
                // Add ellipsis if there's a gap
                if (endPage < totalPages - 1) {
                  pages.push('ellipsis-end');
                }
                pages.push(totalPages);
              }

              return pages;
            };

            const pageNumbers = getPageNumbers();

            return pageNumbers.map((page, index) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center h-8 w-8"
                  >
                    <span className="text-gray-400">...</span>
                  </div>
                );
              }

              return (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            });
          })()}

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