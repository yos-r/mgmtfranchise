import { useState } from 'react';
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
}

export function FranchiseHeader({ franchise, contract, loadFranchises }: FranchiseHeaderProps) {
  const { toast } = useToast();
  const [isTerminating, setIsTerminating] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

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

  const handleRenewContract = async () => {
    try {
      setIsRenewing(true);
      // Calculate the new contract start date
      // Option 1: Start immediately after current contract end
      let newStartDate;

      if (contract.terminated && contract.termination_date) {
        // If the contract was terminated, start from day after termination
        newStartDate = new Date(contract.termination_date);
        newStartDate.setDate(newStartDate.getDate() + 1);
      } else {
        // Calculate when the current contract ends
        const currentStartDate = new Date(contract.start_date);
        const currentEndDate = new Date(currentStartDate);
        currentEndDate.setFullYear(currentEndDate.getFullYear() + contract.duration_years);

        // Start new contract the day after current one ends
        newStartDate = new Date(currentEndDate);
        newStartDate.setDate(newStartDate.getDate() + 1);
      }

      // Format the date for database
      const formattedStartDate = newStartDate.toISOString().split('T')[0];

      // Create a new contract with values from the old one
      const newContract = {
        franchise_id: franchise.id,
        start_date: formattedStartDate,
        duration_years: contract.duration_years,
        initial_fee: 0, // No initial fee for renewal
        royalty_amount: contract.royalty_amount,
        marketing_amount: contract.marketing_amount,
        annual_increase: contract.annual_increase,
        grace_period_months: 0, // No grace period for renewal
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the new contract
      const { data: newContractData, error: contractError } = await supabase
        .from('franchise_contracts')
        .insert(newContract)
        .select();

      if (contractError) {
        console.error("Error creating new contract:", contractError);
        toast({
          title: "Error",
          description: "Failed to create renewed contract",
          variant: "destructive"
        });
        return;
      }

      // Generate new monthly payments for the contract duration
      const payments = [];
      const startYear = newStartDate.getFullYear();
      const startMonth = newStartDate.getMonth();

      for (let i = 0; i < contract.duration_years * 12; i++) {
        // Calculate the payment date: 15th of each month
        const paymentDate = new Date(startYear, startMonth + i, 15);

        // Skip payments for dates in the past
        if (paymentDate < new Date()) continue;

        // Format period name (e.g., "January 2025")
        const periodName = paymentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        payments.push({
          franchise_id: franchise.id,
          due_date: paymentDate.toISOString().split('T')[0],
          amount: contract.royalty_amount + contract.marketing_amount,
          royalty_amount: contract.royalty_amount,
          marketing_amount: contract.marketing_amount,
          status: 'upcoming',
          period: periodName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Insert all the payments if we have any to add
      if (payments.length > 0) {
        const { error: paymentsError } = await supabase
          .from('royalty_payments')
          .insert(payments);

        if (paymentsError) {
          console.error("Error creating payments:", paymentsError);
          toast({
            title: "Warning",
            description: "Contract renewed but there was an issue creating future payments",
            variant: "warning"
          });
        }
      }

      // If all operations succeed, show success message
      toast({
        title: "Contract renewed",
        description: "The franchise contract has been renewed successfully",
      });

      // Reload franchises list if a loadFranchises function was provided
      if (typeof loadFranchises === 'function') {
        loadFranchises();
      }
    } catch (error) {
      console.error("Error in contract renewal:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during contract renewal",
        variant: "destructive"
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const handleTerminateContract = async () => {
    setIsTerminating(true);
    try {
      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // 1. Update the franchise status to 'terminated'
      const { error: franchiseError } = await supabase
        .from('franchises')
        .update({ status: 'terminated' })
        .eq('id', franchise.id);

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

      // If all operations succeed, show success message
      toast({
        title: "Contract terminated",
        description: "The franchise contract has been terminated successfully",
      });

      // Reload franchises list if a loadFranchises function was provided
      if (typeof loadFranchises === 'function') {
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

  return (
    <div className="grid gap-6">
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
          {/* Only show contract buttons if franchise is not terminated */}
          {franchise.status !== 'terminated' && (
            <>
              {/* Renew Contract button - only show for active contracts */}
              {hasContract && !isContractTerminated && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isRenewing}
                    >
                      {isRenewing ?
                        <span>Processing...</span> :
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Renew Contract
                        </>
                      }
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Renew Franchise Contract</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to renew this franchise contract? This will extend the contract for another term under the same conditions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRenewContract}>
                        Renew Contract
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

              {/* Create Contract button - only show if no contract exists */}
              {/* {!hasContract && (
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Contract
                </Button>
              )} */}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}