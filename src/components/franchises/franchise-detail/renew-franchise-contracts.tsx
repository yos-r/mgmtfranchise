import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Euro, Hourglass, Percent, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format, addDays } from "date-fns";

// Define the schema for renewal contract form
const renewalFormSchema = z.object({
    startDate: z.string().date("Invalid date format"),
    durationYears: z.coerce.number().min(1, "Duration must be at least 1 year"),
    royaltyAmount: z.coerce.number().min(0, "Royalty amount cannot be negative"),
    renewalFee: z.coerce.number().min(1,"Renewal fee cannot be zero"),
    marketingAmount: z.coerce.number().min(0, "Marketing amount cannot be negative"),
    annualIncrease: z.coerce.number().min(0, "Annual increase cannot be negative"),
    gracePeriodMonths: z.coerce.number().min(0, "Grace period cannot be negative")
});

interface RenewFranchiseContractProps {
    franchise: {
        id: string;
        name: string;
        status: string;
    };
    contract: {
        id: string;
        start_date: string;
        duration_years: number;
        royalty_amount: number;
        marketing_amount: number;
        annual_increase: number;
        grace_period_months: number;
        terminated?: boolean;
        termination_date?: string;
    };
    loadFranchises?: () => void;
}

export function RenewFranchiseContract({ franchise, contract, loadFranchises }: RenewFranchiseContractProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate the suggested start date for renewal
    const calculateRenewalStartDate = () => {
        let newStartDate;

        if (contract.terminated && contract.termination_date) {
            // If the contract was terminated, start from day after termination
            newStartDate = addDays(new Date(contract.termination_date), 1);
        } else {
            // Calculate when the current contract ends
            const currentStartDate = new Date(contract.start_date);
            const currentEndDate = new Date(currentStartDate);
            currentEndDate.setFullYear(currentEndDate.getFullYear() + contract.duration_years);

            // Start new contract the day after current one ends
            newStartDate = addDays(currentEndDate, 1);
        }

        return format(newStartDate, 'yyyy-MM-dd');
    };

    const renewalForm = useForm<z.infer<typeof renewalFormSchema>>({
        resolver: zodResolver(renewalFormSchema),
        defaultValues: {
            startDate: calculateRenewalStartDate(),
            durationYears: contract.duration_years,
            renewalFee : 0,
            royaltyAmount: contract.royalty_amount,
            marketingAmount: contract.marketing_amount,
            annualIncrease: contract.annual_increase,
            gracePeriodMonths: 0  // Default to 0 for renewals
        }
    });

    const onSubmit = async (values: z.infer<typeof renewalFormSchema>) => {
        setIsProcessing(true);
        try {
            // Insert new contract
            const { data: newContractData, error: contractError } = await supabase
                .from('franchise_contracts')
                .insert({
                    franchise_id: franchise.id,
                    start_date: values.startDate,
                    duration_years: values.durationYears,
                    renewal_fee: values.renewalFee, // No initial fee for renewal
                    royalty_amount: values.royaltyAmount,
                    marketing_amount: values.marketingAmount,
                    annual_increase: values.annualIncrease,
                    grace_period_months: values.gracePeriodMonths
                })
            .select()
                .single();

            if (contractError) throw contractError;

            // Generate payments for the new contract period
            const payments = [];
            const startDate = new Date(values.startDate);
            
            let currentDate = new Date(startDate);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + values.durationYears);
            
            let monthlyRoyalty = values.royaltyAmount;
            let monthlyMarketing = values.marketingAmount;
            let monthCounter = 0;
            
            while (currentDate < endDate) {
                // Determine status based on grace period
                const status = monthCounter < values.gracePeriodMonths ? 'grace' : 'upcoming';
                
                const payment = {
                    franchise_id: franchise.id,
                    contract_id: newContractData.id,
                    due_date: currentDate.toISOString(),
                    amount: monthlyRoyalty + monthlyMarketing,
                    royalty_amount: monthlyRoyalty,
                    marketing_amount: monthlyMarketing,
                    status: status
                };
                
                payments.push(payment);
                
                currentDate.setMonth(currentDate.getMonth() + 1);
                monthCounter++;
                
                if (currentDate.getMonth() === startDate.getMonth()) {
                    monthlyRoyalty *= (1 + values.annualIncrease / 100);
                    monthlyMarketing *= (1 + values.annualIncrease / 100);
                }
            }
            
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
            
            // Update franchise status if needed
            if (franchise.status === 'terminated') {
                const { error: franchiseError } = await supabase
                    .from('franchises')
                    .update({ status: 'active' })
                    .eq('id', franchise.id);
                
                if (franchiseError) {
                    console.error("Error updating franchise status:", franchiseError);
                }
            }

            toast({
                title: "Contract renewed",
                description: "The franchise contract has been renewed successfully",
            });
            
            // Close dialog and reload franchises
            setIsDialogOpen(false);
            if (typeof loadFranchises === 'function') {
                loadFranchises();
            }
        } catch (error) {
            console.error("Error renewing contract:", error);
            toast({
                title: "Error",
                description: "Failed to renew the contract",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
        <span className="flex items-center gap-1">
            {children}
            <span className="text-amber-500">*</span>
        </span>
    );

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline"
                    disabled={isProcessing}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Renew Contract
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Renew Franchise Contract</DialogTitle>
                </DialogHeader>
                <Form {...renewalForm}>
                    <form onSubmit={renewalForm.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={renewalForm.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Start Date</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={renewalForm.control}
                            name="durationYears"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Contract Duration (Years)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={renewalForm.control}
                            name="renewalFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Renewal Fee (€)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={renewalForm.control}
                            name="royaltyAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Monthly Royalty (€)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={renewalForm.control}
                            name="marketingAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Marketing Contribution (€)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={renewalForm.control}
                            name="annualIncrease"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Annual Increase (%)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={renewalForm.control}
                            name="gracePeriodMonths"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <RequiredLabel>Grace Period (Months)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Hourglass className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button 
                                variant="outline" 
                                type="button" 
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Renew Contract"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}