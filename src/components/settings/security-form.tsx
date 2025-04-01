import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Form validation schema
const securityFormSchema = z.object({
  current_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  new_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).refine(
    (password) => {
      // Password strength checks
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    },
    {
      message: "Password must include uppercase, lowercase, number and special character",
    }
  ),
  confirm_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export function SecurityForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data: SecurityFormValues) {
    setIsSubmitting(true);

    try {
      // Step 1: Get the current user
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();

      if (getUserError) {
        throw new Error("Failed to authenticate user. Please try logging in again.");
      }

      if (!user) {
        throw new Error("No authenticated user found. Please log in again.");
      }

      // Step 2: Verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email as string,
        password: data.current_password,
      });

      if (signInError) {
        // If sign-in fails, the current password is incorrect
        throw new Error("Current password is incorrect. Please try again.");
      }

      // Step 3: Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      // Success
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      // Reset the form
      form.reset();

    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Security Settings</CardTitle>
      </CardHeader>
      <CardContent >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">Current Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your current password"
                      type="password"
                      className="body-1"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your new password"
                      type="password"
                      className="body-1"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="legal text-muted-foreground">
                    Password must be at least 8 characters and include uppercase, lowercase,
                    number and special character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label-1">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm your new password"
                      type="password"
                      className="body-1"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="button-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}