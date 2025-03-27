import { format, addYears } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Euro, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Contract {
  id: string;
  type: 'initial' | 'renewal';
  start_date: string;
  duration_years: number;
  initial_fee: number;
  royalty_amount: number;
  marketing_amount: number;
  grace_period_months: number;
  annual_increase: number;
  status: 'active' | 'expired' | 'terminated';
}

const mockContracts: Contract[] = [
  {
    id: "1",
    type: "initial",
    start_date: "2020-01-15",
    duration_years: 5,
    initial_fee: 50000,
    royalty_amount: 2500,
    marketing_amount: 1500,
    grace_period_months: 3,
    annual_increase: 3,
    status: "expired"
  },
  {
    id: "2",
    type: "renewal",
    start_date: "2025-01-15",
    duration_years: 5,
    initial_fee: 25000,
    royalty_amount: 2750,
    marketing_amount: 1650,
    grace_period_months: 1,
    annual_increase: 3,
    status: "active"
  }
];

export function ContractsHistory() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'initial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Initial</Badge>;
      case 'renewal':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Renewal</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewingDetails(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Initial Fee</TableHead>
              <TableHead>Monthly Fees</TableHead>
              <TableHead>Grace Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{getTypeBadge(contract.type)}</TableCell>
                <TableCell>{format(new Date(contract.start_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {format(addYears(new Date(contract.start_date), contract.duration_years), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Euro className="h-3 w-3 text-muted-foreground" />
                    <span>{contract.initial_fee.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">Royalty:</span>
                      <Euro className="h-3 w-3 text-muted-foreground" />
                      <span>{contract.royalty_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">Marketing:</span>
                      <Euro className="h-3 w-3 text-muted-foreground" />
                      <span>{contract.marketing_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contract.grace_period_months} months</TableCell>
                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(contract)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Contract Details Dialog */}
        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contract Details</DialogTitle>
              <DialogDescription>
                {selectedContract?.type.charAt(0).toUpperCase() + selectedContract?.type.slice(1)} Contract
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contract Type</Label>
                  <p>{getTypeBadge(selectedContract?.type || '')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedContract?.status || '')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p>{selectedContract?.start_date && format(new Date(selectedContract.start_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p>
                    {selectedContract?.start_date && 
                     format(addYears(new Date(selectedContract.start_date), selectedContract.duration_years), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{selectedContract?.duration_years} years</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grace Period</Label>
                  <p>{selectedContract?.grace_period_months} months</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Financial Terms</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Initial Fee</span>
                    <p className="text-lg font-medium">€{selectedContract?.initial_fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Annual Increase</span>
                    <p className="text-lg font-medium">{selectedContract?.annual_increase}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Monthly Royalty</span>
                    <p className="text-lg font-medium">€{selectedContract?.royalty_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Marketing Fee</span>
                    <p className="text-lg font-medium">€{selectedContract?.marketing_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}