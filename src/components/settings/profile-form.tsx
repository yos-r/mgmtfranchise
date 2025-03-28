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
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Empty default values as a fallback
const emptyDefaultValues: ProfileFormValues = {
  username: "",
  email: "",
  bio: "",
  urls: [{ value: "" }],
};

export function ProfileForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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
            username:  profile?.first_name +' ' +profile?.last_name || "",
            email: profile.email || user.email || "",
            bio: profile.bio || "",
            urls: profile.urls || [{ value: "" }],
          });
        } else {
          // If no profile exists yet, populate with user auth data
          form.reset({
            username: user.user_metadata?.full_name || "",
            email: user.email || "",
            bio: "",
            urls: [{ value: "" }],
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
      const { data: existingProfile, error: checkError } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from("team_members")
          .update({
            username: data.username,
            email: data.email,
            bio: data.bio,
            urls: data.urls,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        // Create new profile
        result = await supabase
          .from("team_members")
          .insert({
            user_id: userId,
            username: data.username,
            email: data.email,
            bio: data.bio,
            urls: data.urls,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label-1">Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" className="body-1" {...field} />
              </FormControl>
              <FormDescription className="legal text-muted-foreground">
                This is your public display name.
              </FormDescription>
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
                <Input placeholder="Your email" className="body-1" {...field} />
              </FormControl>
              <FormDescription className="legal text-muted-foreground">
                This is the email that will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label-1">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="body-1 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="legal text-muted-foreground">
                You can <span>@mention</span> other users and organizations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        
        {/* <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="label-1">Links</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrl}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add URL
            </Button>
          </div>
          
          {form.watch("urls")?.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="https://example.com" className="body-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(form.watch("urls")?.length || 0) > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(index)}
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <FormDescription className="legal text-muted-foreground">
            Add links to your website, social media profiles, or other resources.
          </FormDescription>
        </div>
         */}
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