import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface FranchiseCardProps {
  franchise: any;
  onSelect: (franchise: any) => void; // Changed to pass the entire franchise object
}

export function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "terminated":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPerformanceBadge(performance: string) {
  switch (performance) {
    case "excellent":
      return <Badge className="bg-green-500">Excellent</Badge>;
    case "good":
      return <Badge className="bg-blue-500">Good</Badge>;
    case "average":
      return <Badge className="bg-yellow-500">Average</Badge>;
    default:
      return <Badge className="bg-gray-500">Unknown</Badge>;
  }
}

export function FranchiseCard({ franchise, onSelect }: FranchiseCardProps) {
  // Function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Function to calculate contract start date (first contract)
  const getStartDate = () => {
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
  const getExpirationDate = () => {
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
  const getTerminationDate = () => {
    if (!franchise.franchise_contracts || franchise.franchise_contracts.length === 0) {
      return null;
    }
    
    // Find terminated contract
    const terminatedContract = franchise.franchise_contracts.find(
      (contract: any) => contract.terminated === "yes" || contract.terminated === true
    );
    
    return terminatedContract ? formatDate(terminatedContract.termination_date) : null;
  };

  const isTerminated = franchise.status === "terminated";
  const terminationDate = getTerminationDate();
  const startDate = getStartDate();
  const expirationDate = getExpirationDate();

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(franchise)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex-shrink-0">
                {franchise.logo ? (
                  <img src={franchise.logo} alt={franchise.name} className="w-12 h-12 rounded-sm object-contain" />
                ) : (
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg" 
                    alt="Century 21" 
                    className="w-10 h-10 rounded-sm" 
                  />
                )}
              </div>
              
              {/* Franchise name and owner */}
              <div>
                <h3 className="font-medium">{franchise.name}</h3>
                <p className="text-sm text-muted-foreground">{franchise.owner_name}</p>
              </div>
            </div>
            <Badge className={getStatusColor(franchise.status)}>
              {franchise.status}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{franchise.address}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Start Date</p>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                {startDate}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Expiration Date</p>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                {expirationDate}
              </div>
            </div>
          </div>
          
          {isTerminated && terminationDate && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Termination Date</p>
              <div className="flex items-center text-sm text-red-600">
                <Calendar className="mr-2 h-3 w-3" />
                {terminationDate}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Agents</p>
              <p className="font-medium">{franchise.agents}</p>
            </div>
            <div className="space-y-1 flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}