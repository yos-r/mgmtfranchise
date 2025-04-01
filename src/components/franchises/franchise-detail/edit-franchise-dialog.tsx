import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDropzone } from 'react-dropzone';
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
  FormDescription,
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
import { Image, User, X } from "lucide-react";

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
  logo: z.any().optional(),
  owner_avatar: z.any().optional(),
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
  
  // State for images
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ownerAvatar, setOwnerAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  // Reset form and previews when franchise changes or dialog opens
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
      
      // Set image previews if images exist
      if (franchise.logo) {
        setLogoPreview(franchise.logo);
      } else {
        setLogoPreview(null);
      }
      
      if (franchise.owner_avatar) {
        setAvatarPreview(franchise.owner_avatar);
      } else {
        setAvatarPreview(null);
      }
      
      // Reset file state
      setCompanyLogo(null);
      setOwnerAvatar(null);
    }
  }, [franchise, open, form]);

  // Dropzone setup for company logo
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setCompanyLogo(file);
      form.setValue('logo', file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
  });

  // Dropzone setup for owner avatar
  const { getRootProps: getAvatarRootProps, getInputProps: getAvatarInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setOwnerAvatar(file);
      form.setValue('owner_avatar', file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
  });

  const onSubmit = async (values: z.infer<typeof franchiseFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Initialize update with form fields
      const updateData: any = {
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
      };
      
      // Upload logo if changed
      if (companyLogo) {
        const fileExt = companyLogo.name.split('.').pop();
        const fileName = `logo_${Date.now()}_${values.company_name.replace(/\s+/g, '_')}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('franchise-attachments')
          .upload(fileName, companyLogo, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('franchise-attachments')
          .getPublicUrl(fileName);
        
        updateData.logo = urlData.publicUrl;
      }
      else{
        updateData.logo=null
      }
      
      // Upload owner avatar if changed
      if (ownerAvatar) {
        const fileExt = ownerAvatar.name.split('.').pop();
        const fileName = `avatar_${Date.now()}_${values.owner_name.replace(/\s+/g, '_')}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('franchise-attachments')
          .upload(fileName, ownerAvatar, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('franchise-attachments')
          .getPublicUrl(fileName);
        
        updateData.owner_avatar = urlData.publicUrl;
      }
      else{
        updateData.owner_avatar=null
      }

      // Update the franchise record with all data
      const { data, error } = await supabase
        .from('franchises')
        .update(updateData)
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
        // If no data returned, at least return the form values with image URLs
        onSuccess({
          ...franchise,
          ...updateData
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Franchise</DialogTitle>
          <DialogDescription>
            Update the franchise information, logo, and owner avatar
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            
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

            

            
            {/* Image Uploads Section */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Company Logo Upload */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      Upload a company logo or branding image
                    </FormDescription>
                    <div className="flex flex-col gap-4">
                      <div 
                        {...getLogoRootProps()} 
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <input {...getLogoInputProps()} />
                        <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium mt-2">
                          {companyLogo ? companyLogo.name : "Upload Logo"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {companyLogo ? 
                            `${(companyLogo.size / 1024 / 1024).toFixed(2)} MB` : 
                            "Drop image here or click to browse"}
                        </p>
                      </div>
                      
                      {logoPreview && (
                        <div className="flex flex-col items-center">
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border shadow-sm bg-muted">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs text-destructive hover:text-destructive/90"
                            onClick={() => {
                              setCompanyLogo(null);
                              setLogoPreview(null);
                              // Only reset preview if it's not the original server image
                              // if (!franchise.logo || logoPreview !== franchise.logo) {
                              //   setLogoPreview(franchise.logo || null);
                              // }
                              form.setValue('logo', undefined);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Owner Avatar Upload */}
              <FormField
                control={form.control}
                name="owner_avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Avatar</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      Upload a photo of the franchise owner
                    </FormDescription>
                    <div className="flex flex-col gap-4">
                      <div 
                        {...getAvatarRootProps()} 
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <input {...getAvatarInputProps()} />
                        <User className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium mt-2">
                          {ownerAvatar ? ownerAvatar.name : "Upload Avatar"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ownerAvatar ? 
                            `${(ownerAvatar.size / 1024 / 1024).toFixed(2)} MB` : 
                            "Drop image here or click to browse"}
                        </p>
                      </div>
                      
                      {avatarPreview && (
                        <div className="flex flex-col items-center">
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border shadow-sm bg-muted">
                            <img 
                              src={avatarPreview} 
                              alt="Avatar preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs text-destructive hover:text-destructive/90"
                            onClick={() => {
                              setOwnerAvatar(null);
                              setAvatarPreview(null);
                              // Only reset preview if it's not the original server image
                              if (!franchise.owner_avatar || avatarPreview !== franchise.owner_avatar) {
                                setAvatarPreview(franchise.owner_avatar || null);
                              }
                              form.setValue('owner_avatar', undefined);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      )}
                    </div>
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