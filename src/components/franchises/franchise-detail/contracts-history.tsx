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
import { Euro, Eye, FileText, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EditContractDialog } from "./edit-contract-dialog";

interface Contract {
  id: string;
  start_date: string;
  duration_years: number;
  initial_fee: number;
  royalty_amount: number;
  marketing_amount: number;
  grace_period_months: number;
  annual_increase: number;
  terminated?: boolean;
  termination_date?: string;
  document_url?: string;
  renewal_fee?: number;
}

interface ContractsHistoryProps {
  contracts: Contract[];
  franchise_id: string;
}

export function ContractsHistory({ contracts, franchise_id }: ContractsHistoryProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine contract type and status
  const processedContracts = contracts.map((contract, index) => {
    // Determine contract type (first one is initial, rest are renewals)
    const type = index === 0 ? 'initial' : 'renewal';
    
    // Determine contract status
    let status: 'active' | 'expired' | 'terminated';
    
    if (contract.terminated=='yes' || contract.terminated=='true') {
      status = 'terminated';
    } else {
      const startDate = new Date(contract.start_date);
      const endDate = addYears(startDate, contract.duration_years);
      status = new Date() > endDate ? 'expired' : 'active';
    }
    
    return { ...contract, type, status };
  });

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

  const handleViewDetails = (contract: any) => {
    setSelectedContract(contract);
    setIsViewingDetails(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setIsEditingContract(true);
  };

  const handleContractUpdated = () => {
    // Refresh the contracts list
    setRefreshKey(prev => prev + 1);
  };

  const getEndDate = (contract: Contract) => {
    if (contract.terminated && contract.termination_date) {
      return format(new Date(contract.termination_date), 'MMM d, yyyy');
    } else {
      return format(addYears(new Date(contract.start_date), contract.duration_years), 'MMM d, yyyy');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts History</CardTitle>
      </CardHeader>
      <CardContent>
        {processedContracts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No contracts found for this franchise
          </div>
        ) : (
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
              {processedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{getTypeBadge(contract.type)}</TableCell>
                  <TableCell>{format(new Date(contract.start_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getEndDate(contract)}</TableCell>
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
                    <div className="flex justify-end items-center space-x-2">
                      {contract.document_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contract.document_url, '_blank')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Document
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(contract)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContract(contract)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

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
                  <p>{selectedContract?.type && getTypeBadge(selectedContract.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{selectedContract?.status && getStatusBadge(selectedContract.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p>{selectedContract?.start_date && format(new Date(selectedContract.start_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p>
                    {selectedContract && getEndDate(selectedContract)}
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
                {selectedContract?.terminated && selectedContract?.termination_date && (
                  <div>
                    <Label className="text-muted-foreground">Termination Date</Label>
                    <p>{format(new Date(selectedContract.termination_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Financial Terms</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {selectedContract?.initial_fee > 0 && <div>
                    <span className="text-sm text-muted-foreground">Initial Fee</span>
                    <p className="text-lg font-medium">€{selectedContract?.initial_fee.toLocaleString()}</p>
                  </div>}
                  {selectedContract?.renewal_fee > 0 && <div>
                    <span className="text-sm text-muted-foreground">Renewal Fee</span>
                    <p className="text-lg font-medium">€{selectedContract?.renewal_fee.toLocaleString()}</p>
                  </div>}
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

              <div className="flex justify-between pt-4">
                {selectedContract?.document_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedContract.document_url, '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Contract Document
                  </Button>
                )}
                {/* <Button 
                  onClick={() => {
                    setIsViewingDetails(false);
                    setIsEditingContract(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Contract
                </Button> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Contract Dialog */}
        <EditContractDialog
          contract={selectedContract}
          open={isEditingContract}
          onOpenChange={setIsEditingContract}
          onContractUpdated={handleContractUpdated}
          franchiseId={franchise_id}
        />
      </CardContent>
    </Card>
  );
}