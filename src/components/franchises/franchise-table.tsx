import { useState, useEffect } from 'react';
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
import { supabase } from "@/lib/auth";

// Function to determine the conformity indicator color
const getConformityColor = (conformity) => {
  if (conformity >= 80) return "bg-green-500";
  if (conformity >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

// Function to determine the conformity text color
const getConformityTextColor = (conformity) => {
  if (conformity >= 80) return "text-green-600";
  if (conformity >= 60) return "text-yellow-600";
  return "text-red-600";
};

interface FranchiseTableProps {
  franchises: any[];
  onFranchiseSelect: (franchise: any) => void;
  isLoading?: boolean;
}

export function FranchiseTable({ franchises, onFranchiseSelect, isLoading = false,onVisitSelect }: FranchiseTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conformityData, setConformityData] = useState({});
  
  // Fetch support visits data to calculate conformity averages
  useEffect(() => {
    const fetchSupportVisits = async () => {
      try {
        const { data, error } = await supabase
          .from('support_visits')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error("Error fetching support visits:", error);
          return;
        }
        
        // Calculate average conformity by franchise
        const conformityByFranchise = {};
        
        data.forEach(visit => {
          if (visit.franchise_id && (visit.conformity !== null && visit.conformity !== undefined)) {
            if (!conformityByFranchise[visit.franchise_id]) {
              conformityByFranchise[visit.franchise_id] = {
                total: 0,
                count: 0
              };
            }
            
            conformityByFranchise[visit.franchise_id].total += visit.conformity;
            conformityByFranchise[visit.franchise_id].count += 1;
          }
        });
        
        // Calculate averages
        const averageConformity = {};
        Object.keys(conformityByFranchise).forEach(franchiseId => {
          const { total, count } = conformityByFranchise[franchiseId];
          averageConformity[franchiseId] = Math.round(total / count);
        });
        
        setConformityData(averageConformity);
      } catch (err) {
        console.error("Exception fetching support visits:", err);
      }
    };
    
    fetchSupportVisits();
  }, []);

  // Function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd/MM/yyyy');
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
              <TableHead>Conformity</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {filteredFranchises.map((franchise) => {
              const isTerminated = franchise.status === "terminated";
              const terminationDate = getTerminationDate(franchise);
              const startDate = getStartDate(franchise);
              const expirationDate = getExpirationDate(franchise);
              const conformity = conformityData[franchise.id];

              return (
                <TableRow
                  key={franchise.id}
                  className="cursor-pointer"
                  onClick={() => onFranchiseSelect(franchise)}
                >
                  <TableCell className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {franchise.logo && <img src={franchise.logo} alt="" className="w-12 rounded-sm" />}
                      {!franchise.logo && <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg" className="w-10 h-10 rounded-sm" />}
                    </div>
                    
                    {/* Franchise name and owner */}
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
                  
                  {/* Conformity indicator cell */}
                  <TableCell>
                    {conformity !== null && conformity !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${getConformityColor(conformity)} h-1.5 rounded-full`}
                            style={{ width: `${conformity}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getConformityTextColor(conformity)}`}>
                          {conformity}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not available</span>
                    )}
                  </TableCell>
                  
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