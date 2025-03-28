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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
  // bio: z.string().max(160).optional(), // Made bio optional since it's commented out in the form
  // urls: z
  //   .array(
  //     z.object({
  //       value: z.string().url({ message: "Please enter a valid URL." }),
  //     })
  //   )
  //   .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Empty default values as a fallback
const emptyDefaultValues: ProfileFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  // bio: "",
  // urls: [{ value: "" }],
};

export function ProfileForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: emptyDefaultValues,
    mode: "onSubmit", // Changed from onChange to make submission easier
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
            // bio: profile.bio || "",
            // urls: profile.urls || [{ value: "" }],
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
            // bio: "",
            // urls: [{ value: "" }],
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

  // Add a new URL field
  const addUrl = () => {
    const currentUrls = form.getValues("urls") || [];
    form.setValue("urls", [...currentUrls, { value: "" }]);
  };

  // Remove a URL field
  const removeUrl = (index: number) => {
    const currentUrls = form.getValues("urls") || [];
    if (currentUrls.length > 1) {
      form.setValue(
        "urls",
        currentUrls.filter((_, i) => i !== index)
      );
    }
  };

  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    console.log('Submitting form with data:', data);
    
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
      // Check if profile exists
      // const { data: existingProfile, error: checkError } = await supabase
      //   .from("team_members")
      //   .select("id")
      //   .eq("user_id", userId)
      //   .maybeSingle();
      
      // if (checkError) {
      //   throw checkError;
      // }
      
      let result;
      console.log('updating ', data.email)
      
      // if (existingProfile) {
        // Update existing profile
        // eslint-disable-next-line prefer-const
        result = await supabase
          .from("team_members")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      // } else {
      //   // Create new profile
      //   result = await supabase
      //     .from("team_members")
      //     .insert({
      //       user_id: userId,
      //       first_name: data.firstName,
      //       last_name: data.lastName,
      //       email: data.email,
            
      //       created_at: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     });
      // }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
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
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(
          (data) => { 
            console.log("Validation Passed", data); 
            onSubmit(data);
          },
          (errors) => {
            console.error("Validation Failed", errors);
            toast({
              title: "Form validation failed",
              description: "Please check the form for errors.",
              variant: "destructive",
            });
          }
        )} 
        className="space-y-8"
      >
        <div>
          <FormLabel className="label-1 block mb-2">Name</FormLabel>
          <FormDescription className="legal text-muted-foreground mb-2">
            This is your public display name.
          </FormDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
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
                  <FormControl>
                    <Input placeholder="Last name" className="body-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label-1">Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" className="body-1" {...field} />
              </FormControl>
              <FormDescription className="legal text-muted-foreground">
                This is the email that will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
            'Save changes'
          )}
        </Button>
      </form>
    </Form>
  );
}