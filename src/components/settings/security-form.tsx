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

const securityFormSchema = z.object({
  current_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  new_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
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
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  function onSubmit(data: SecurityFormValues) {
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    form.reset();
  }

  return (
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
                  {...field}
                />
              </FormControl>
              <FormDescription className="legal text-muted-foreground">
                Password must be at least 8 characters long.
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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="button-1">Update password</Button>
      </form>
    </Form>
  );
}