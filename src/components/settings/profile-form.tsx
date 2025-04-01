import { useState, useEffect } from "react";
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, User, Mail, AtSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters.",
    })
    .max(30, {
      message: "First name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last name must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Empty default values as a fallback
const emptyDefaultValues: ProfileFormValues = {
  firstName: "",
  lastName: "",
  email: "",
};

export function ProfileForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>("");
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: emptyDefaultValues,
    mode: "onChange",
  });

  // Fetch the current user's profile data when component mounts
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        
        // Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!user) {
          toast({
            title: "Authentication error",
            description: "You must be logged in to view your profile.",
            variant: "destructive",
          });
          return;
        }
        
        setUserId(user.id);
        setOriginalEmail(user.email || "");
        
        // Fetch the user's profile data from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from("team_members")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (profileError && profileError.code !== "PGRST116") { // PGRST116 is "row not found"
          throw profileError;
        }
        
        // If profile exists, populate the form
        if (profile) {
          form.reset({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || user.email || "",
          });
        } else {
          // If no profile exists yet, populate with user auth data
          // Split full name into first and last if available
          let firstName = "";
          let lastName = "";
          
          if (user.user_metadata?.full_name) {
            const nameParts = user.user_metadata.full_name.split(" ");
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
          }
          
          form.reset({
            firstName,
            lastName,
            email: user.email || "",
          });
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [toast, form]);

  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if email is being changed
      const isEmailChanged = data.email !== originalEmail;
      
      // First update the team_members table
      const { error: profileError } = await supabase
        .from("team_members")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      
      if (profileError) {
        throw profileError;
      }
      
      // If email is being changed, update the auth.users table
      if (isEmailChanged) {
        // Update email in Supabase Auth
        const { error: authUpdateError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (authUpdateError) {
          throw authUpdateError;
        }
        
        // Email verification is typically required by Supabase
        toast({
          title: "Email verification required",
          description: "A verification email has been sent to your new email address. Please check your inbox.",
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Update the stored original email if it was changed
      if (isEmailChanged) {
        setOriginalEmail(data.email);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    {/* <User className="h-4 w-4 text-muted-foreground" /> */}
                    Name
                  </FormLabel>
                  <FormDescription className="text-sm text-muted-foreground mb-4">
                    This is your public display name.
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label-1">First name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" className="body-1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label-1">Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" className="body-1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    {/* <Mail className="h-4 w-4 text-muted-foreground" /> */}
                    Contact Information
                  </FormLabel>
                  <FormDescription className="text-sm text-muted-foreground mb-4">
                    This email will be used for account access and notifications.
                  </FormDescription>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label-1">Email Address</FormLabel>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input 
                              placeholder="Your email" 
                              className="pl-10 body-1" 
                              {...field}
                            />
                          </FormControl>
                        </div>
                        {field.value !== originalEmail && (
                          <FormDescription className="text-amber-500 mt-2">
                            Changing your email will require verification of your new address.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mt-6"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}