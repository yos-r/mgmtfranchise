import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const companyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  registration_number: z.string().min(1, {
    message: "Registration number is required.",
  }),
  vat_number: z.string().min(1, {
    message: "VAT number is required.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  phone: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }),
  currency_code: z.string().min(1, {
    message: "Currency code is required.",
  }),
});

// List of common currencies
const currencies = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
];

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with empty values
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      registration_number: "",
      vat_number: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      currency_code: "EUR",
    },
    mode: "onChange",
  });

  // Fetch company settings from Supabase on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // Fetch company settings
        const { data: companyData, error: companyError } = await supabase
          .from("app_settings")
          .select("value")
          .eq("id", "company")
          .single();

        if (companyError) {
          throw companyError;
        }

        // Fetch currency settings
        const { data: currencyData, error: currencyError } = await supabase
          .from("app_settings")
          .select("value")
          .eq("id", "currency")
          .single();

        if (currencyError) {
          throw currencyError;
        }

        // Prepare form data
        const formData: any = {
          currency_code: "EUR" // Default
        };

        // Add company data
        if (companyData && companyData.value) {
          const company = companyData.value;
          formData.name = company.name || "";
          formData.registration_number = company.registration_number || "";
          formData.vat_number = company.vat_number || "";
          formData.address = company.address || "";
          formData.phone = company.phone || "";
          formData.email = company.email || "";
          formData.website = company.website || "";
        }

        // Add currency data
        if (currencyData && currencyData.value && currencyData.value.code) {
          formData.currency_code = currencyData.value.code;
        }

        // Update form
        form.reset(formData);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form, toast]);

  // Submit handler to update settings in Supabase
  async function onSubmit(data: CompanyFormValues) {
    try {
      setIsSaving(true);

      // Create the company JSON object to save
      const companyData = {
        name: data.name,
        registration_number: data.registration_number,
        vat_number: data.vat_number,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
      };

      // Create the currency JSON object to save
      const currencyData = {
        code: data.currency_code
      };

      // Update the app_settings table for company
      const { error: companyError } = await supabase
        .from("app_settings")
        .update({ value: companyData })
        .eq("id", "company");

      if (companyError) {
        throw companyError;
      }

      // Update the app_settings table for currency
      const { error: currencyError } = await supabase
        .from("app_settings")
        .update({ value: currencyData })
        .eq("id", "currency");

      if (currencyError) {
        throw currencyError;
      }

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading company settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" className="body-1" {...field} />
                    </FormControl>
                    <FormDescription className="legal text-muted-foreground">
                      Your registered company name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Registration number" className="body-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vat_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="VAT number" className="body-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Company address"
                        className="body-1 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" className="body-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Company email" className="body-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Company website" className="body-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label-1">Default Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="body-1">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="legal text-muted-foreground">
                      This currency will be used for all financial transactions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="button-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save all changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}