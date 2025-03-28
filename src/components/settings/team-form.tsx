import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const teamMemberSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "consultant"], {
    required_error: "Please select a role",
  }),
});

type TeamMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export function TeamForm() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof teamMemberSchema>>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "consultant",
    },
  });

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  async function loadTeamMembers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading team members",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading team members:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsAddingMember(open);
  };

  async function onSubmit(data: z.infer<typeof teamMemberSchema>) {
    try {
      // Insert the new team member
      const { data: newMember, error } = await supabase
        .from("team_members")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: data.role,
          status: "active" // Set default status
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the UI immediately
      setMembers(prevMembers => [newMember, ...prevMembers]);
      
      toast({
        title: "Team member added",
        description: "The team member has been added successfully",
      });

      // Close the dialog and reset the form
      setIsAddingMember(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error adding team member",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error adding team member:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      // Mark the team member as inactive
      const { error } = await supabase
        .from("team_members")
        .update({ status: "inactive" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update the UI immediately
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === id 
            ? { ...member, status: "inactive" } 
            : member
        )
      );

      toast({
        title: "Team member removed",
        description: "The team member has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error removing team member",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error removing team member:", error);
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "manager":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Manager</Badge>;
      case "consultant":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Consultant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="tagline-2">Team Members</h3>
          <p className="body-lead text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        <Dialog open={isAddingMember} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="button-1">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="tagline-2">Add Team Member</DialogTitle>
              <DialogDescription className="body-lead">
                Add a new member to your team
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">First Name</FormLabel>
                      <FormControl>
                        <Input className="body-1" {...field} />
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
                      <FormLabel className="label-1">Last Name</FormLabel>
                      <FormControl>
                        <Input className="body-1" {...field} />
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
                        <Input className="body-1" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label-1">Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="button-1">Add Member</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <p>Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">No team members found. Add one to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Name</TableHead>
                <TableHead className="label-1">Email</TableHead>
                <TableHead className="label-1">Role</TableHead>
                <TableHead className="label-1">Status</TableHead>
                <TableHead className="label-1 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="body-1 font-medium">
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell className="body-1">{member.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(member.role)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member.id)}
                      disabled={member.status !== "active"}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}