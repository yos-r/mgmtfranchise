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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  // Owner Information
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(10, "Phone number must be at least 10 characters"),

  // Company Information
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyTaxId: z.string().min(5, "Tax ID must be at least 5 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),

  // Financial Information
  royaltyAmount: z.number().min(0, "Royalty amount must be positive"),
  marketingAmount: z.number().min(0, "Marketing amount must be positive"),
  annualIncrease: z.number().min(0, "Annual increase must be positive").max(100, "Annual increase cannot exceed 100%"),

  // Contract Information
  startDate: z.string(),
  contractDuration: z.number().min(1, "Contract duration must be at least 1 year"),
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
      royaltyAmount: 0,
      marketingAmount: 0,
      annualIncrease: 3,
      contractDuration: 5,
      startDate: format(new Date(), 'yyyy-MM-dd'),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Franchise created",
      description: "The franchise has been successfully created",
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
                <div {...getOwnerRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input {...getOwnerInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">
                    {ownerImage ? ownerImage.name : "Drop owner's photo here or click to upload"}
                  </p>
                </div>

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
                          <Input className="pl-9" placeholder="+1 234 567 890" {...field} />
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
                <div {...getAgencyRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input {...getAgencyInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="body-1 mt-2">
                    {agencyImage ? agencyImage.name : "Drop agency photo here or click to upload"}
                  </p>
                </div>

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
              <div className="grid grid-cols-3 gap-4">
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