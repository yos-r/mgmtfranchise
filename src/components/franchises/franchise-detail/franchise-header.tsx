import { useState, useEffect } from 'react';
import { format, differenceInMonths } from 'date-fns';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Euro,
  TrendingUp,
  RefreshCw,
  Ban,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";
import { AddFranchiseContract } from './add-franchise-contract';
import { RenewFranchiseContract } from './renew-franchise-contracts';
import { EditFranchiseDialog } from './edit-franchise-dialog';

interface FranchiseHeaderProps {
  franchise: {
    id: string;
    name: string;
    owner_name: string;
    owner_email: string;
    phone: string;
    address: string;
    company_name: string;
    logo: string;
    email: string;
    status: string;
  };
  contract?: {
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
  };
  loadFranchises?: () => void;
  onDelete: () => void;
  onUpdate: (updatedFranchise?: any) => void;
}

export function FranchiseHeader({ franchise, contract, loadFranchises, onDelete, onUpdate }: FranchiseHeaderProps) {
  const { toast } = useToast();
  const [isTerminating, setIsTerminating] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Check if contract exists before accessing its properties
  const hasContract = contract !== undefined;
  const isContractTerminated = hasContract && contract.terminated === true;

  // Only calculate these values if contract exists and is not terminated
  const startDate = hasContract ? new Date(contract.start_date) : new Date();
  const endDate = hasContract ? new Date(startDate) : new Date();

  if (hasContract && !isContractTerminated) {
    endDate.setFullYear(endDate.getFullYear() + contract.duration_years);
  } else if (hasContract && isContractTerminated && contract.termination_date) {
    // If contract is terminated, set end date to termination date
    endDate.setTime(new Date(contract.termination_date).getTime());
  }

  const totalMonths = hasContract ? contract.duration_years * 12 : 0;
  const monthsElapsed = hasContract ? differenceInMonths(new Date(), startDate) : 0;
  const progress = hasContract ? Math.min(Math.round((monthsElapsed / totalMonths) * 100), 100) : 0;

  const handleDeleteFranchise = async () => {
    try {
      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', franchise.id);

      if (error) throw error;

      toast({
        title: "Franchise deleted",
        description: "The franchise and all related records have been deleted successfully",
      });
      
      // Call parent handlers
      if (onDelete) {
        onDelete();
      }
      
      if (loadFranchises) {
        loadFranchises();
      }
    } catch (error: any) {
      console.error("Error deleting franchise:", error);
      toast({
        title: "Error",
        description: "Failed to delete the franchise. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTerminateContract = async () => {
    setIsTerminating(true);
    try {
      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // 1. Update the franchise status to 'terminated'
      const { data: franchiseData, error: franchiseError } = await supabase
        .from('franchises')
        .update({ status: 'terminated' })
        .eq('id', franchise.id)
        .select();

      if (franchiseError) {
        console.error("Error updating franchise status:", franchiseError);
        toast({
          title: "Error",
          description: "Failed to update franchise status",
          variant: "destructive"
        });
        setIsTerminating(false);
        return;
      }

      // 2. Update the contract status to 'terminated' and set termination date
      const { error: contractError } = await supabase
        .from('franchise_contracts')
        .update({
          terminated: true,
          termination_date: today
        })
        .eq('id', contract?.id);

      if (contractError) {
        console.error("Error updating contract:", contractError);
        toast({
          title: "Error",
          description: "Failed to update contract status",
          variant: "destructive"
        });
        setIsTerminating(false);
        return;
      }

      // 3. Delete future payments for this franchise
      const { error: paymentsError } = await supabase
        .from('royalty_payments')
        .delete()
        .eq('franchise_id', franchise.id)
        .gt('due_date', today)
        .is('payment_date', null); // Only delete unpaid payments

      if (paymentsError) {
        console.error("Error deleting future payments:", paymentsError);
        toast({
          title: "Warning",
          description: "Contract terminated but there was an issue deleting future payments",
          variant: "warning"
        });
        setIsTerminating(false);
        return;
      }

      // Update parent component with the new franchise data (including terminated status)
      if (franchiseData && franchiseData.length > 0) {
        onUpdate(franchiseData[0]);
      } else {
        // Fallback if no data is returned
        onUpdate({
          ...franchise,
          status: 'terminated'
        });
      }

      // If all operations succeed, show success message
      toast({
        title: "Contract terminated",
        description: "The franchise contract has been terminated successfully",
      });

      // Also call the parent loadFranchises if provided
      if (loadFranchises) {
        loadFranchises();
      }
    } catch (error) {
      console.error("Error in contract termination:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during contract termination",
        variant: "destructive"
      });
    } finally {
      setIsTerminating(false);
    }
  };

  // Function to handle franchise update from EditFranchiseDialog
  const handleFranchiseUpdated = (updatedFranchise) => {
    // Pass the updated franchise data to the parent component
    if (onUpdate) {
      onUpdate(updatedFranchise);
    }
    
    // Also call the parent loadFranchises if available
    if (loadFranchises) {
      loadFranchises();
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {franchise.logo ? (
                <img
                  src={franchise.logo}
                  alt={franchise.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{franchise.name}</h1>
                  {franchise.status === 'terminated' && (
                    <Badge variant="destructive">Terminated</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{franchise.company_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="button-2"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Franchise
              </Button>

              {/* Only show contract buttons if franchise is not terminated */}
              {franchise.status !== 'terminated' && (
                <>
                  {/* Renew Contract button - only show for active contracts */}
                  {hasContract && !isContractTerminated && (
                    <RenewFranchiseContract 
                      franchise={franchise} 
                      contract={contract}
                      loadFranchises={loadFranchises} 
                    />
                  )}

                  {/* Terminate Contract button - only show for active contracts */}
                  {hasContract && !isContractTerminated && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isTerminating}
                        >
                          {isTerminating ?
                            <span>Processing...</span> :
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Terminate Contract
                            </>
                          }
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Terminate Franchise Contract</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to terminate this franchise contract? This action will:
                            <ul className="list-disc mt-2 ml-6 space-y-1">
                              <li>Mark the franchise as terminated</li>
                              <li>Set the contract termination date to today</li>
                              <li>Delete all future unpaid royalty payments</li>
                            </ul>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleTerminateContract}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isTerminating}
                          >
                            {isTerminating ? "Processing..." : "Terminate Contract"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}

              {/* Delete Franchise button - only show for terminated franchises */}
              {franchise.status === 'terminated' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Franchise
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Franchise</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this franchise? This will permanently remove:
                        <ul className="list-disc mt-2 ml-6 space-y-1">
                          <li>All franchise information</li>
                          <li>All contracts and payments history</li>
                          <li>All support and training records</li>
                        </ul>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteFranchise}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Owner Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{franchise.owner_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${franchise.owner_email}`} className="text-primary hover:underline">
                      {franchise.owner_email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${franchise.owner_phone}`} className="text hover:underline">
                      {franchise.owner_phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Agency Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{franchise.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{franchise.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${franchise.email}`} className="text-primary hover:underline">
                      {franchise.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {hasContract ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Contract Progress</h3>
                    {isContractTerminated && (
                      <Badge variant="destructive">Terminated</Badge>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{format(startDate, 'MMM d, yyyy')}</span>
                    <span>
                      {isContractTerminated && contract.termination_date
                        ? `Terminated: ${format(new Date(contract.termination_date), 'MMM d, yyyy')}`
                        : format(endDate, 'MMM d, yyyy')
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Contract Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Initial Fee</span>
                      </div>
                      <p className="text-lg font-semibold">€{contract.initial_fee.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Monthly Royalty</span>
                      </div>
                      <p className="text-lg font-semibold">€{contract.royalty_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Marketing Fee</span>
                      </div>
                      <p className="text-lg font-semibold">€{contract.marketing_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Annual Increase</span>
                      </div>
                      <p className="text-lg font-semibold">{contract.annual_increase}%</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Grace Period</span>
                      </div>
                      <p className="text-lg font-semibold">{contract.grace_period_months} months</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Duration</span>
                      </div>
                      <p className="text-lg font-semibold">{contract.duration_years} years</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">No Active Contract</h3>
                  <p className="text-muted-foreground mb-4">This franchise doesn't have an active contract.</p>
                  {!hasContract && (
                    <AddFranchiseContract
                      franchise={franchise}
                      loadFranchises={loadFranchises}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditFranchiseDialog
        franchise={franchise}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={handleFranchiseUpdated}
      />
    </div>
  );
}