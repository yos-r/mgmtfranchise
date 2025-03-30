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
  FileUp
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(8, "Phone number must be at least 8 characters"),

  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  century21Name: z.string().min(2, "Century 21 name must be at least 2 characters"),
  companyTaxId: z.string().min(5, "Tax ID must be at least 5 characters"),
  companyPhone: z.string().min(8, "Phone number must be at least 8 characters"),
  companyEmail: z.string().email("Invalid email address"),

  address: z.string().min(10, "Address must be at least 10 characters"),
  commune: z.string(),
  // contract information
  royaltyAmount: z.number().min(0, "Royalty amount must be at least 0"),
  marketingAmount: z.number().min(0, "Marketing amount must be at least 0"),
  annualIncrease: z.number().min(0, "Annual increase must be at least 0"),
  startDate: z.string().transform((val) => format(new Date(val), 'yyyy-MM-dd')),
  contractDuration: z.number().min(1, "Contract duration must be at least 1 year"),
  initialFee: z.number().min(0, 'Initial fee must be at least 0 '),
  gracePeriodMonths: z.number().min(0, 'Grace period must be at least 0 '),
  contractDocument: z.any().optional(), // This will store the File object
});

interface AddFranchiseProps {
  onCancel: () => void;
}

export function AddFranchise({ onCancel }: AddFranchiseProps) {
  const [agencyImage, setAgencyImage] = useState<File | null>(null);
  const [ownerImage, setOwnerImage] = useState<File | null>(null);
  const [contractDocument, setContractDocument] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set default values if needed
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

  const { getRootProps: getContractDocRootProps, getInputProps: getContractDocInputProps } = useDropzone({
    accept: { 'application/pdf': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setContractDocument(acceptedFiles[0]);
      form.setValue('contractDocument', acceptedFiles[0]);
    },
  });

  async function generateMonthlyPayments(
    franchiseId: number, 
    contractId: number,
    startDate: Date, 
    durationYears: number, 
    royaltyAmount: number, 
    marketingAmount: number, 
    annualIncrease: number,
    graceMonths: number // New parameter with default of 0
  ) {
      const payments = [];
      let currentDate = new Date(startDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + durationYears);
  
      let monthlyRoyalty = royaltyAmount;
      let monthlyMarketing = marketingAmount;
      let monthCounter = 0; // Track which month we're on
  
      while (currentDate < endDate) {
        // Determine status based on grace period
        const status = monthCounter < graceMonths ? 'grace' : 'upcoming';
        
        const payment = {
          franchise_id: franchiseId,
          contract_id: contractId,
          due_date: currentDate.toISOString(),
          amount: monthlyRoyalty+monthlyMarketing,
          royalty_amount: monthlyRoyalty,
          marketing_amount: monthlyMarketing,
          status: status
        };
  
        payments.push(payment);
  
        currentDate.setMonth(currentDate.getMonth() + 1);
        monthCounter++; // Increment month counter
  
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
    try {
      const validatedData = formSchema.parse(values);
      
      // Insert franchise data
      const { data, error } = await supabase
        .from('franchises')
        .insert({
          owner_name: validatedData.ownerName,
          owner_email: validatedData.ownerEmail,
          owner_phone: validatedData.ownerPhone,
          company_name: validatedData.companyName,
          name: validatedData.century21Name,
          tax_id: validatedData.companyTaxId,
          address: validatedData.address,
          commune: validatedData.commune,
          email: validatedData.companyEmail,
          phone: validatedData.companyPhone,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Insert contract data
      const { data: contractData, error: contractError } = await supabase
        .from('franchise_contracts')
        .insert({
          franchise_id: data.id,
          start_date: validatedData.startDate,
          duration_years: validatedData.contractDuration,
          initial_fee: validatedData.initialFee,
          royalty_amount: validatedData.royaltyAmount,
          marketing_amount: validatedData.marketingAmount,
          annual_increase: validatedData.annualIncrease,
          grace_period_months: validatedData.gracePeriodMonths
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // Generate payments
      await generateMonthlyPayments(
        data.id, // newly created franchise
        contractData.id, // newly created contract
        new Date(validatedData.startDate),
        validatedData.contractDuration,
        validatedData.royaltyAmount,
        validatedData.marketingAmount,
        validatedData.annualIncrease,
        validatedData.gracePeriodMonths
      );

      // Upload contract document if available
      let documentUrl = null;
      if (contractDocument) {
        // Create a unique file path
        const fileExt = contractDocument.name.split('.').pop();
      const fileName = `contract_${Date.now()}_${contractData.id}.${fileExt}`;
const filePath = fileName; // No folders, just the file
        
      //   // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('franchise-documents')
          .upload(filePath, contractDocument, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
      //   // Get the public URL for the file
        const { data: urlData } = supabase.storage
          .from('franchise-documents')
          .getPublicUrl(filePath);
        
        documentUrl = urlData.publicUrl;
        
      //   // Update the contract record with the document URL
        const { error: updateError } = await supabase
          .from('franchise_contracts')
          .update({ document_url: documentUrl })
          .eq('id', contractData.id);
        
        if (updateError) throw updateError;
      }

      toast({
        title: "Franchise Contract created",
        description: "The franchise contract has been successfully created",
      });
      
      onCancel();
    } catch (error) {
      console.error('Error creating franchise:', error);
      toast({
        title: "Error",
        description: "There was an error creating the franchise",
        variant: "destructive",
      });
    }
  }
  
  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="flex items-center gap-1">
      {children}
      <span className="text-amber-500">*</span>
    </span>
  );

  return (
    <div className="container mx-auto p-6 pt-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
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

                <FormField
                  control={form.control}
                  name="ownerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Phone</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="+32 xxx xxx xxx" {...field} />
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
                <div className="w-full flex gap-x-2">
                  <FormField
                    control={form.control}
                    name="century21Name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="label-1">
                          <RequiredLabel>Century 21 Name</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9 w-full" placeholder="CENTURY 21 Example" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="label-1">
                          <RequiredLabel>Company Name</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9 w-full" placeholder="XYZ SARL" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          <Input className="pl-9" placeholder="BE 12 345 678 901" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                  
                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label-1">
                          <RequiredLabel>Commune</RequiredLabel>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a commune" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1000">1000 - Brussels City</SelectItem>
                            <SelectItem value="1020">1020 - Laeken</SelectItem>
                            <SelectItem value="1030">1030 - Schaerbeek</SelectItem>
                            <SelectItem value="1040">1040 - Etterbeek</SelectItem>
                            <SelectItem value="1050">1050 - Ixelles</SelectItem>
                            <SelectItem value="1060">1060 - Saint-Gilles</SelectItem>
                            <SelectItem value="1070">1070 - Anderlecht</SelectItem>
                            <SelectItem value="1080">1080 - Molenbeek-Saint-Jean</SelectItem>
                            <SelectItem value="1081">1081 - Koekelberg</SelectItem>
                            <SelectItem value="1082">1082 - Berchem-Sainte-Agathe</SelectItem>
                            <SelectItem value="1083">1083 - Ganshoren</SelectItem>
                            <SelectItem value="1090">1090 - Jette</SelectItem>
                            <SelectItem value="1120">1120 - Neder-Over-Heembeek</SelectItem>
                            <SelectItem value="1130">1130 - Haren</SelectItem>
                            <SelectItem value="1140">1140 - Evere</SelectItem>
                            <SelectItem value="1150">1150 - Woluwe-Saint-Pierre</SelectItem>
                            <SelectItem value="1160">1160 - Auderghem</SelectItem>
                            <SelectItem value="1170">1170 - Watermael-Boitsfort</SelectItem>
                            <SelectItem value="1180">1180 - Uccle</SelectItem>
                            <SelectItem value="1190">1190 - Forest</SelectItem>
                            <SelectItem value="1200">1200 - Woluwe-Saint-Lambert</SelectItem>
                            <SelectItem value="1210">1210 - Saint-Josse-ten-Noode</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Company Email</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="xyz@century21.be" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        <RequiredLabel>Company Phone</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="+32 xxx xxx xxx" {...field} />
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
                          <Hourglass className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
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

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="contractDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">
                        Contract Document
                      </FormLabel>
                      <FormControl>
                        <div {...getContractDocRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                          <input {...getContractDocInputProps()} />
                          <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
                          <p className="body-1 mt-3 font-medium">
                            {contractDocument ? contractDocument.name : "Upload Contract Document"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {contractDocument ? 
                              `${(contractDocument.size / 1024 / 1024).toFixed(2)} MB` : 
                              "Drop your file here or click to browse (PDF, DOC, DOCX)"}
                          </p>
                        </div>
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