import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import {
  Building2,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Euro,
  Calendar,
  Upload,
  ArrowLeft,
  Hourglass,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/auth';

const formSchema = z.object({
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  ownerEmail: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyTaxId: z.string().min(5, "Tax ID must be at least 5 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  // contract information
  royaltyAmount: z.number().min(0, "Royalty amount must be at least 0"),
  marketingAmount: z.number().min(0, "Marketing amount must be at least 0"),
  annualIncrease: z.number().min(0, "Annual increase must be at least 0"),
  startDate: z.string().transform((val) => format(new Date(val), 'yyyy-MM-dd')),
  contractDuration: z.number().min(1, "Contract duration must be at least 1 year"),
  initialFee: z.number().min(0, 'Initial fee must be at least 0 '),
  gracePeriodMonths: z.number().min(0, 'Grace period must be at least 0 '),
});

interface AddFranchiseProps {
  onCancel: () => void;
}

export function AddFranchise({ onCancel }: AddFranchiseProps) {
  const [agencyImage, setAgencyImage] = useState<File | null>(null);
  const [ownerImage, setOwnerImage] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {

    },
  });

  const { getRootProps: getAgencyRootProps, getInputProps: getAgencyInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setAgencyImage(acceptedFiles[0]);
    },
  });

  const { getRootProps: getOwnerRootProps, getInputProps: getOwnerInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setOwnerImage(acceptedFiles[0]);
    },
  });
  async function generateMonthlyPayments(franchiseId: number, startDate: Date, durationYears: number, royaltyAmount: number, marketingAmount: number, annualIncrease: number) {
    const payments = [];
    let currentDate = new Date(startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + durationYears);

    let monthlyRoyalty = royaltyAmount;
    let monthlyMarketing = marketingAmount;

    while (currentDate < endDate) {
      const payment = {
        franchise_id: franchiseId,
        due_date: currentDate.toISOString(),
        amount: monthlyRoyalty,
        royalty_amount: monthlyRoyalty,
        marketing_amount: monthlyMarketing,
        status: 'upcoming'
      };

      payments.push(payment);

      currentDate.setMonth(currentDate.getMonth() + 1);

      if (currentDate.getMonth() === startDate.getMonth()) {
        monthlyRoyalty *= (1 + annualIncrease / 100);
        monthlyMarketing *= (1 + annualIncrease / 100);
      }
    }

    const { data, error } = await supabase
      .from('royalty_payments')
      .insert(payments);

    if (error) {
      console.error('Error inserting payments:', error);
      throw error;
    }

    return payments;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const validatedData = formSchema.parse(values)
    const { data, error } = await supabase
      .from('franchises')
      .insert({
        owner_name: validatedData.ownerName,
        owner_email: validatedData.ownerEmail,
        company_name: validatedData.companyName,
        name: validatedData.companyName,
        tax_id: validatedData.companyTaxId,
        address: validatedData.address,
        // created_at: new Date().toISOString(),
        status: 'active'
      })
      .select().single(); // Use .select() to return the inserted row

    // console.log('franchise cerated with id',data.id)
    const { data2, error2 } = await supabase.from('franchise_contracts')
      .insert({
        franchise_id: data.id,
        start_date: validatedData.startDate,
        duration_years: validatedData.contractDuration,
        initial_fee: validatedData.initialFee,
        royalty_amount: validatedData.royaltyAmount,
        marketing_amount: validatedData.marketingAmount,
        annual_increase: validatedData.annualIncrease,
        grace_period_months: validatedData.gracePeriodMonths
      }).select().single();
    try {
      await generateMonthlyPayments(
        data.id,
        new Date(validatedData.startDate),
        validatedData.contractDuration,
        validatedData.marketingAmount,
        validatedData.royaltyAmount,
        validatedData.annualIncrease
      );
    } catch (paymentError) {
      console.error('Error generating payments:', paymentError);
      // Optionally handle payment generation failure
    }
    toast({
      title: "Franchise Contract created",
      description: "The franchise contract has been successfully created",
    });
    onCancel();
  }
  

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="flex items-center gap-1">
      {children}
      <span className="text-amber-500">*</span>
    </span>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onCancel} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Franchises
          </Button>
          <h1 className="tagline-1 mt-2">Add New Franchise</h1>
          <p className="body-lead text-muted-foreground">
            Create a new franchise with all required information
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Owner Information</CardTitle>
                <CardDescription className="body-lead">
                  Enter the franchise owner's details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div {...getOwnerRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input {...getOwnerInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">
                    {ownerImage ? ownerImage.name : "Drop owner's photo here or click to upload"}
                  </p>
                </div> */}

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Owner Name</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="John Doe" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Email</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="john@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Company Information</CardTitle>
                <CardDescription className="body-lead">
                  Enter the franchise company details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div {...getAgencyRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input {...getAgencyInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">
                    {agencyImage ? agencyImage.name : "Drop agency photo here or click to upload"}
                  </p>
                </div> */}

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Company Name</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="CENTURY 21 Example" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyTaxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Tax ID</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="FR 12 345 678 901" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Address</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="123 Example Street" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Financial Information</CardTitle>
              <CardDescription className="body-lead">
                Set up the financial terms for the franchise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="initialFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Initial Fee (€)</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-9"
                            placeholder="25000"
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
                  control={form.control}
                  name="royaltyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Monthly Royalty (€)</RequiredLabel>
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
                  control={form.control}
                  name="marketingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Marketing Contribution (€)</RequiredLabel>
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
                  control={form.control}
                  name="annualIncrease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Annual Increase (%)</RequiredLabel>
                      </FormLabel>
                      <FormControl>

                        <Input
                          type="number"
                          placeholder="3"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gracePeriodMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Grace Period</RequiredLabel>
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
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Contract Information</CardTitle>
              <CardDescription className="body-lead">
                Set the contract terms and duration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Start Date</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Contract Duration (Years)</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={onCancel} className="button-2">
              Cancel
            </Button>
            <Button type="submit" className="button-1">
              Create Franchise
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}