import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Euro, Hourglass, Percent, Plus } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Define the schema for the contract form
const contractFormSchema = z.object({
    startDate: z.string().date("Invalid date format"),
    durationYears: z.coerce.number().min(1, "Duration must be at least 1 year"),
    // initialFee: z.coerce.number().min(0, "Initial fee cannot be negative"),
    royaltyAmount: z.coerce.number().min(0, "Royalty amount cannot be negative"),
    marketingAmount: z.coerce.number().min(0, "Marketing amount cannot be negative"),
    annualIncrease: z.coerce.number().min(0, "Annual increase cannot be negative"),
    gracePeriodMonths: z.coerce.number().min(0, "Grace period cannot be negative")
});

export function AddFranchiseContract({ franchise,loadFranchises }: any) {
    const [contractDetailsVisible, setContractDetailsVisible] = useState<{ [key: number]: boolean }>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const contractForm = useForm<z.infer<typeof contractFormSchema>>({
        resolver: zodResolver(contractFormSchema),
        defaultValues: {
            startDate: new Date().toISOString().split('T')[0],
            durationYears: 1,
            // initialFee: 0,
            royaltyAmount: 0,
            marketingAmount: 0,
            annualIncrease: 0,
            gracePeriodMonths: 0
        }
    });

    const onSubmit = async (values: z.infer<typeof contractFormSchema>) => {
        try {
            // Insert new contract
            const { data, error } = await supabase
                .from('franchise_contracts')
                .insert({
                    franchise_id: franchise.id,
                    start_date: values.startDate,
                    duration_years: values.durationYears,
                    royalty_amount: values.royaltyAmount,
                    marketing_amount: values.marketingAmount,
                    annual_increase: values.annualIncrease,
                    grace_period_months: values.gracePeriodMonths
                })
                .select()
                .single();

            if (error) throw error;
            // await  loadFranchises();

            // Optionally, generate payments or show success toast
            toast({
                title: "Contrat ajouté",
                description: "Le contrat a été ajouté avec succès"
            });

            // Close dialog
            setIsDialogOpen(false);
        } catch (error2) {
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter le contrat",
                variant: "destructive"
            });
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
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 " />
                    {/* Nouveau Contrat */}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajouter  contrat</DialogTitle>
                </DialogHeader>
                <Form {...contractForm}>
                    <form onSubmit={contractForm.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={contractForm.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date de début</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={contractForm.control}
                            name="durationYears"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durée du contrat (années)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={contractForm.control}
                            name="royaltyAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="label-1">
                                        <RequiredLabel>Redevance Mensuelle (€)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                placeholder="2500"
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
                            control={contractForm.control}
                            name="marketingAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="label-1">
                                        <RequiredLabel>Contribution Marketing (€)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                placeholder="1500"
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
                            control={contractForm.control}
                            name="annualIncrease"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="label-1">
                                        <RequiredLabel>Augmentation annuelle(%)</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                            type="number"
                                            className="pl-9"
                                            placeholder="3"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                        /></div>

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={contractForm.control}
                            name="gracePeriodMonths"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="label-1">
                                        <RequiredLabel>Mois de grace</RequiredLabel>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Hourglass className='absolute left-3 top-3 h-4 w-4 text-muted-foreground'></Hourglass>
                                            <Input
                                                type="number"
                                                className="pl-9"
                                                placeholder="2"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Add similar FormFields for other contract details */}
                        <Button type="submit">Ajouter contrat</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    );
}