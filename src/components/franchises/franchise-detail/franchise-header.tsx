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
  Banknote,
  User,
  ArrowLeft,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from '@/hooks/useCurrency';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    owner_avatar: string;
    phone: string;
    address: string;
    commune: string;
    company_name: string;
    logo: string;
    email: string;
    status: string;
    conformity?: number; // Optional conformity score
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
    renewal_fee?: number;
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
  const { formatCurrency } = useCurrency();
  const [averageConformity, setAverageConformity] = useState<number | null>(null);
  
  // Check if contract exists before accessing its properties
  const hasContract = contract !== undefined;
  const isContractTerminated = hasContract && contract.terminated === true;

  // Fetch average conformity score for this franchise on component mount
  useEffect(() => {
    const fetchAverageConformity = async () => {
      try {
        const { data, error } = await supabase
          .from('support_visits')
          .select('conformity')
          .eq('franchise_id', franchise.id)
          .not('conformity', 'is', null);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Calculate average conformity score
          const sum = data.reduce((acc, visit) => acc + (visit.conformity || 0), 0);
          const avg = Math.round(sum / data.length);
          setAverageConformity(avg);
        } else if (franchise.conformity) {
          // Use franchise conformity if available
          setAverageConformity(franchise.conformity);
        }
      } catch (error) {
        console.error("Error fetching conformity data:", error);
      }
    };

    if (franchise.id) {
      fetchAverageConformity();
    }
  }, [franchise.id, franchise.conformity]);

  // Function to get color based on conformity score
  const getConformityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 65) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

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

  // Dropdown menu actions for mobile view
  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Franchise
        </DropdownMenuItem>
        
        {franchise.status !== 'terminated' && hasContract && !isContractTerminated && (
          <>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
                // We'll need a ref to the RenewFranchiseContract component
                // This is just a placeholder; the actual implementation would vary
                document.getElementById('renew-contract-button')?.click();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Contract
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                document.getElementById('terminate-contract-button')?.click();
              }}
            >
              <Ban className="h-4 w-4 mr-2" />
              Terminate Contract
            </DropdownMenuItem>
          </>
        )}
        
        {franchise.status === 'terminated' && (
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              document.getElementById('delete-franchise-button')?.click();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Franchise
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-x-6">
        <Button variant="ghost" onClick={onDelete} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Header section - Mobile Optimized */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* Logo/Icon */}
              {franchise.logo ? (
                <img
                  src={franchise.logo}
                  alt={franchise.name}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              )}
              
              {/* Franchise Name and Info */}
              <div className="min-w-0 flex-">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold truncate mr-1">{franchise.name}</h1>
                  {franchise.status === 'terminated' && (
                    <Badge variant="destructive" className="text-sm">Terminated</Badge>
                  )}
                  {averageConformity !== null && (
                  <div className="flex items-center ">
                    <div className="flex items-center px-2 py-1 border rounded-md bg-muted">
                      <CheckCircle className="h-2 w- sm:h-4 sm:w-4 mr-1.5 text-obsessedgrey/60" />
                      <div className="flex items-center">
                        <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2">Conformity:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`${getConformityColor(averageConformity)} h-1.5 rounded-full transition-all duration-300 ease-in-out`} 
                              style={{ width: `${averageConformity}%` }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold">{averageConformity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
                <p className="text-muted-foreground text-sm truncate">{franchise.company_name}</p>
                
                {/* Conformity Score Badge - Responsive */}
                
              </div>
            </div>
            
            {/* Action Buttons - Desktop */}
            <div className="hidden sm:flex items-center space-x-2">
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
                    <div id="renew-contract-button-container">
                      <RenewFranchiseContract 
                        franchise={franchise} 
                        contract={contract}
                        loadFranchises={loadFranchises} 
                      />
                    </div>
                  )}

                  {/* Terminate Contract button - only show for active contracts */}
                  {hasContract && !isContractTerminated && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          id="terminate-contract-button"
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
                    <Button 
                      id="delete-franchise-button"
                      variant="destructive"
                    >
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
            
            {/* Mobile Actions Dropdown */}
            <div className="sm:hidden flex justify-end">
              <ActionsDropdown />
            </div>
          </div>

          {/* Content Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Owner and Agency Information */}
            <div className="space-y-4">
              {/* Owner Information */}
              <div className="space-y-2">
                <h3 className="font-semibold">Owner Information</h3>
                <div className="flex gap-x-3 md:gap-x-4 items-center">
                  <div className="flex-shrink-0">
                    <img src={franchise.owner_avatar} className='w-12 sm:w-16 rounded-full border' /> 
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{franchise.owner_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${franchise.owner_email}`} className="text-primary hover:underline text-sm truncate">
                        {franchise.owner_email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${franchise.owner_phone}`} className="hover:underline text-sm truncate">
                        {franchise.owner_phone || "N/A"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency Information */}
              <div className="space-y-2">
                <h3 className="font-semibold">Agency Information</h3>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{franchise.address} {franchise.commune ? `– ${franchise.commune}` : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{franchise.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <a href={`mailto:${franchise.email}`} className="text-primary hover:underline text-sm truncate">
                      {franchise.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Information - Responsive */}
            {hasContract ? (
              <div className="space-y-4">
                {/* Contract Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Contract Progress</h3>
                    {isContractTerminated && (
                      <Badge variant="destructive">Terminated</Badge>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>{format(startDate, 'MMM d, yyyy')}</span>
                    <span>
                      {isContractTerminated && contract.termination_date
                        ? `Terminated: ${format(new Date(contract.termination_date), 'MMM d, yyyy')}`
                        : format(endDate, 'MMM d, yyyy')
                      }
                    </span>
                  </div>
                </div>

                {/* Contract Details - Responsive Grid */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Contract Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {contract.initial_fee > 0 && <div>
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Initial Fee</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{formatCurrency(contract.initial_fee)}</p>
                    </div>}
                    {contract.renewal_fee > 0 && <div>
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Renewal Fee</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{formatCurrency(contract.renewal_fee)}</p>
                    </div>}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Monthly Royalty</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{formatCurrency(contract.royalty_amount)}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Marketing Fee</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{formatCurrency(contract.marketing_amount)}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Annual Increase</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{contract.annual_increase}%</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Grace Period</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{contract.grace_period_months} months</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Duration</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">{contract.duration_years} years</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4 sm:p-6 bg-muted rounded-lg w-full">
                  <h3 className="font-semibold mb-2">No Active Contract</h3>
                  <p className="text-muted-foreground mb-4 text-sm">This franchise doesn't have an active contract.</p>
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