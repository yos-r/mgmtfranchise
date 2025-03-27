import { Receipt, Filter, Search, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Franchise {
  id: string;
  name: string;
  address?: string;
}

interface RoyaltiesHeaderProps {
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onFranchiseSelect?: (franchiseId: string | null) => void;
  currentFilter?: string;
  currentSearch?: string;
  franchises?: Franchise[];
  selectedFranchise?: string | null;
}

export function RoyaltiesHeader({
  onFilterChange,
  onSearchChange,
  onFranchiseSelect,
  currentFilter = "all",
  currentSearch = "",
  franchises = [],
  selectedFranchise = null,
}: RoyaltiesHeaderProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (franchiseId: string) => {
    if (onFranchiseSelect) {
      onFranchiseSelect(franchiseId === selectedFranchise ? null : franchiseId);
    }
    setOpen(false);
  };

  const selectedFranchiseName = franchises.find(f => f.id === selectedFranchise)?.name || "All Franchises";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="tagline-1">Royalty Payments</h2>
        <p className="body-lead text-muted-foreground">
          Manage and track franchise royalty payments
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {/* Franchise Selection Dropdown with Search */}
        {/* <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
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
                    onSelect={() => handleSelect("")}
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
                        onSelect={() => handleSelect(franchise.id)}
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
        </Popover> */}

        {/* Status Filter */}
        {/* <Select 
          defaultValue={currentFilter} 
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
        </Select> */}

        {/* Search Input */}
        {/* <div className="relative w-[200px]">
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
        </div> */}
      </div>
    </div>
  );
}