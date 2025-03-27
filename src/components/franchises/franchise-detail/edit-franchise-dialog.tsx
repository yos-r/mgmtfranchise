import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";

// Create a RequiredLabel component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span>{children} <span className="text-destructive">*</span></span>
);

const franchiseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  owner_name: z.string().min(2, "Owner name must be at least 2 characters"),
  owner_email: z.string().email("Invalid email address"),
  owner_phone: z.string().min(8, "Phone number must be at least 8 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  tax_id: z.string().min(5, "Tax ID must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  commune: z.string().min(1, "Please select a commune"),
});

interface EditFranchiseDialogProps {
  franchise: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedFranchise?: any) => void;
}

export function EditFranchiseDialog({
  franchise,
  open,
  onOpenChange,
  onSuccess,
}: EditFranchiseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const formRef = useRef(null);

  const form = useForm<z.infer<typeof franchiseFormSchema>>({
    resolver: zodResolver(franchiseFormSchema),
    defaultValues: {
      name: franchise.name,
      owner_name: franchise.owner_name,
      owner_email: franchise.owner_email,
      owner_phone: franchise.owner_phone || "",
      company_name: franchise.company_name,
      tax_id: franchise.tax_id || "",
      email: franchise.email,
      phone: franchise.phone,
      address: franchise.address,
      commune: franchise.commune || "",
    },
  });

  // Reset form when franchise changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: franchise.name,
        owner_name: franchise.owner_name,
        owner_email: franchise.owner_email,
        owner_phone: franchise.owner_phone || "",
        company_name: franchise.company_name,
        tax_id: franchise.tax_id || "",
        email: franchise.email,
        phone: franchise.phone,
        address: franchise.address,
        commune: franchise.commune || "",
      });
    }
  }, [franchise, open, form]);

  const onSubmit = async (values: z.infer<typeof franchiseFormSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .update({
          name: values.name,
          owner_name: values.owner_name,
          owner_email: values.owner_email,
          owner_phone: values.owner_phone,
          company_name: values.company_name,
          tax_id: values.tax_id,
          email: values.email,
          phone: values.phone,
          address: values.address,
          commune: values.commune,
        })
        .eq('id', franchise.id)
        .select();

      if (error) throw error;

      toast({
        title: "Franchise updated",
        description: "The franchise information has been updated successfully",
      });

      // Important: Return the updated franchise data to immediately update the UI
      if (data && data.length > 0) {
        onSuccess(data[0]);
      } else {
        // If no data returned, at least return the form values
        onSuccess({
          ...franchise,
          ...values
        });
      }
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Franchise</DialogTitle>
          <DialogDescription>
            Update the franchise information
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Century 21 Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}