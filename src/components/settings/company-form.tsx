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
import { useToast } from "@/hooks/use-toast";

const companyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  registrationNumber: z.string().min(5, {
    message: "Registration number must be at least 5 characters.",
  }),
  vatNumber: z.string().min(5, {
    message: "VAT number must be at least 5 characters.",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const defaultValues: Partial<CompanyFormValues> = {
  name: "CENTURY 21 Corporate",
  registrationNumber: "123456789",
  vatNumber: "FR12345678901",
  address: "123 Avenue des Champs-Élysées, 75008 Paris",
  phone: "+33 1 23 45 67 89",
  email: "contact@century21.fr",
  website: "https://century21.fr",
};

export function CompanyForm() {
  const { toast } = useToast();
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: CompanyFormValues) {
    toast({
      title: "Company settings updated",
      description: "Your company settings have been updated successfully.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registrationNumber"
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
            name="vatNumber"
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
        <div className="grid grid-cols-2 gap-4">
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
        <Button type="submit" className="button-1">Save changes</Button>
      </form>
    </Form>
  );
}