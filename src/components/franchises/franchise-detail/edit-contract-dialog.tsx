import { useState, useEffect } from "react";
import { format, addYears } from "date-fns";
import { CalendarIcon, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Contract {
  id: string;
  start_date: string;
  duration_years: number;
  initial_fee: number;
  royalty_amount: number;
  marketing_amount: number;
  grace_period_months: number;
  annual_increase: number;
  terminated?: string;
  termination_date?: string;
  document_url?: string;
  renewal_fee?: number;
}

interface EditContractDialogProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContractUpdated?: () => void;
  franchiseId: string;
}

export function EditContractDialog({
  contract,
  open,
  onOpenChange,
  onContractUpdated,
  franchiseId
}: EditContractDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [durationYears, setDurationYears] = useState<number>(5);
  const [initialFee, setInitialFee] = useState<number>(0);
  const [renewalFee, setRenewalFee] = useState<number>(0);
  const [royaltyAmount, setRoyaltyAmount] = useState<number>(0);
  const [marketingAmount, setMarketingAmount] = useState<number>(0);
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(0);
  const [annualIncrease, setAnnualIncrease] = useState<number>(0);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [terminationDate, setTerminationDate] = useState<Date | undefined>(undefined);
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  // Populate form with contract data when opened
  useEffect(() => {
    if (contract && open) {
      setStartDate(contract.start_date ? new Date(contract.start_date) : undefined);
      setDurationYears(contract.duration_years || 5);
      setInitialFee(contract.initial_fee || 0);
      setRenewalFee(contract.renewal_fee || 0);
      setRoyaltyAmount(contract.royalty_amount || 0);
      setMarketingAmount(contract.marketing_amount || 0);
      setGracePeriodMonths(contract.grace_period_months || 0);
      setAnnualIncrease(contract.annual_increase || 0);
      setIsTerminated(['yes','true'].includes(contract.terminated) || false);
      setTerminationDate(contract.termination_date ? new Date(contract.termination_date) : undefined);
      setDocumentUrl(contract.document_url || "");
    }
  }, [contract, open]);

  const handleSubmit = async () => {
    if (!contract) return;
    
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData = {
        franchise_id: franchiseId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        duration_years: durationYears,
        initial_fee: initialFee,
        renewal_fee: renewalFee,
        royalty_amount: royaltyAmount,
        marketing_amount: marketingAmount,
        grace_period_months: gracePeriodMonths,
        annual_increase: annualIncrease,
        terminated: isTerminated? 'yes' : 'no',
        termination_date: terminationDate ? format(terminationDate, 'yyyy-MM-dd') : null,
        document_url: documentUrl || null
      };

      const { data, error } = await supabase
        .from('franchise_contracts')
        .update(contractData)
        .eq('id', contract.id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Contract Updated",
        description: "Contract has been successfully updated",
      });
      
      onOpenChange(false);
      if (onContractUpdated) {
        onContractUpdated();
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: "Error",
        description: "Failed to update contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrencyInput = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal point
    const value = e.target.value.replace(/[^\d.]/g, '');
    setter(parseFloat(value) || 0);
  };

  const handleNumberInput = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/\D/g, '');
    setter(parseInt(value) || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
          <DialogDescription>
            Update the contract details for this franchise
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={`justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (Years)</Label>
            <Input
              id="duration"
              value={durationYears}
              onChange={handleNumberInput(setDurationYears)}
            />
          </div>
          
          {contract?.initial_fee>0 && <div className="grid gap-2">
            <Label htmlFor="initial-fee">Initial Fee (€)</Label>
            <Input
              id="initial-fee"
              value={initialFee}
              onChange={handleCurrencyInput(setInitialFee)}
            />
          </div>}
          
          {contract?.renewal_fee>0 && <div className="grid gap-2">
            <Label htmlFor="renewal-fee">Renewal Fee (€)</Label>
            <Input
              id="renewal-fee"
              value={renewalFee}
              onChange={handleCurrencyInput(setRenewalFee)}
            />
          </div>}
          
          <div className="grid gap-2">
            <Label htmlFor="royalty">Monthly Royalty (€)</Label>
            <Input
              id="royalty"
              value={royaltyAmount}
              onChange={handleCurrencyInput(setRoyaltyAmount)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="marketing">Monthly Marketing Fee (€)</Label>
            <Input
              id="marketing"
              value={marketingAmount}
              onChange={handleCurrencyInput(setMarketingAmount)}
            />
          </div>
          
          {contract?.initial_fee>0 && <div className="grid gap-2">
            <Label htmlFor="grace-period">Grace Period (Months)</Label>
            <Input
              id="grace-period"
              value={gracePeriodMonths}
              onChange={handleNumberInput(setGracePeriodMonths)}
            />
          </div>}
          
          <div className="grid gap-2">
            <Label htmlFor="annual-increase">Annual Increase (%)</Label>
            <Input
              id="annual-increase"
              value={annualIncrease}
              onChange={handleNumberInput(setAnnualIncrease)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="document-url">Contract Document URL</Label>
            <Input
              id="document-url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              checked={isTerminated}
              onCheckedChange={setIsTerminated}
              id="terminated"
            />
            <Label htmlFor="terminated">Contract Terminated</Label>
          </div>
          
          {isTerminated && (
            <div className="grid gap-2">
              <Label htmlFor="termination-date">Termination Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="termination-date"
                    variant={"outline"}
                    className={`justify-start text-left font-normal ${!terminationDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {terminationDate ? format(terminationDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={terminationDate}
                    onSelect={setTerminationDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}