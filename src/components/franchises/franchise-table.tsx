import { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, MoreHorizontal, Mail, Phone, FileText, TrendingUp, Search, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusColor, getPerformanceBadge } from "./franchise-card";

interface FranchiseTableProps {
  franchises: any[];
  onFranchiseSelect: (franchise: any) => void;
  isLoading?: boolean;
}

export function FranchiseTable({ franchises, onFranchiseSelect, isLoading = false }: FranchiseTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Function to calculate contract start date (first contract)
  const getStartDate = (franchise: any) => {
    if (!franchise.franchise_contracts || franchise.franchise_contracts.length === 0) {
      return "No contract";
    }
    
    // Sort contracts by start_date to get the first one
    const sortedContracts = [...franchise.franchise_contracts].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    return formatDate(sortedContracts[0].start_date);
  };

  // Function to calculate expiration date (start_date + duration of the last contract)
  const getExpirationDate = (franchise: any) => {
    if (!franchise.franchise_contracts || franchise.franchise_contracts.length === 0) {
      return "No contract";
    }
    
    // Sort contracts by start_date to get the last one
    const sortedContracts = [...franchise.franchise_contracts].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    const lastContract = sortedContracts[sortedContracts.length - 1];
    const startDate = new Date(lastContract.start_date);
    startDate.setFullYear(startDate.getFullYear() + lastContract.duration_years);
    
    return formatDate(startDate.toISOString());
  };

  // Function to get termination date if contract is terminated
  const getTerminationDate = (franchise: any) => {
    if (!franchise.franchise_contracts || franchise.franchise_contracts.length === 0) {
      return null;
    }
    
    // Find terminated contract
    const terminatedContract = franchise.franchise_contracts.find(
      (contract: any) => contract.terminated === "yes" || contract.terminated === true
    );
    
    return terminatedContract ? formatDate(terminatedContract.termination_date) : null;
  };

  const filteredFranchises = franchises.filter(franchise => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      (franchise.name || '').toLowerCase().includes(searchTerm) ||
      (franchise.owner_name || '').toLowerCase().includes(searchTerm) ||
      (franchise.address || '').toLowerCase().includes(searchTerm) ||
      (franchise.email || '').toLowerCase().includes(searchTerm) ||
      (franchise.phone || '').toLowerCase().includes(searchTerm) ||
      (franchise.status || '').toLowerCase().includes(searchTerm) ||
      (franchise.agents?.toString() || '').includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search franchises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Franchise</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFranchises.map((franchise) => {
              const isTerminated = franchise.status === "terminated";
              const terminationDate = getTerminationDate(franchise);
              const startDate = getStartDate(franchise);
              const expirationDate = getExpirationDate(franchise);
              
              return (
                <TableRow
                  key={franchise.id}
                  className="cursor-pointer"
                  onClick={() => onFranchiseSelect(franchise)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{franchise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {franchise.owner_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{franchise.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(franchise.status)}>
                      {franchise.status}
                    </Badge>
                    {isTerminated && terminationDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Terminated: {terminationDate}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {startDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {expirationDate}
                    </div>
                  </TableCell>
                  <TableCell>{franchise.agents}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{franchise.email}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{franchise.phone}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>View Contract</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>Performance Report</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}