import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, Paperclip, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

const ticketSchema = z.object({
  franchise_id: z.string().uuid("Please select a franchise"),
  contact_name: z.string().min(2, "Contact name must be at least 2 characters"),
  franchise_email: z.string().email("Invalid email address"),
  franchise_phone: z.string().min(8, "Phone number must be at least 8 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["technical", "billing", "general", "training", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export function SubmitTicketPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [isLoadingFranchises, setIsLoadingFranchises] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: "medium",
      category: "general",
    },
  });

  // Fetch franchises on component mount
  useEffect(() => {
    const fetchFranchises = async () => {
      setIsLoadingFranchises(true);
      try {
        const { data, error } = await supabase
          .from('franchises')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        setFranchises(data || []);
      } catch (error) {
        console.error("Error fetching franchises:", error);
        toast({
          title: "Failed to load franchises",
          description: "Could not load the list of franchises. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFranchises(false);
      }
    };

    fetchFranchises();
  }, [toast]);

  // Handle file uploads
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      // Check file size
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the maximum file size of 10MB`,
            variant: "destructive",
          });
          return false;
        }
        
        // Check file type
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an accepted file type`,
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      });
      
      setFiles(prev => [...prev, ...validFiles]);
    },
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    }
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
    setIsSubmitting(true);
    try {
      // Get the selected franchise data
      const selectedFranchise = franchises.find(f => f.id === values.franchise_id);
      
      // Insert ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('help_desk_tickets')
        .insert({
          franchise_id: values.franchise_id,
          franchise_name: selectedFranchise?.name || "",
          contact_name: values.contact_name,
          franchise_email: values.franchise_email,
          franchise_phone: values.franchise_phone,
          title: values.title,
          description: values.description,
          category: values.category,
          priority: values.priority,
          status: 'open',
        })
        .select();

      if (ticketError) throw ticketError;
      
      const ticketId = ticketData[0].id;
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          // Upload to storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${ticketId}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error("File upload error:", uploadError);
            continue;
          }
          
          // Save file metadata to database
          await supabase
            .from('ticket_attachments')
            .insert({
              ticket_id: ticketId,
              name: file.name,
              url: filePath,
              size: `${Math.round(file.size / 1024)} KB`,
              type: file.type,
            });
        }
      }

      toast({
        title: "Ticket submitted",
        description: "Your support ticket has been submitted successfully. We'll get back to you soon.",
      });

      // Reset form
      form.reset();
      setFiles([]);

      // Redirect to success page or home
      navigate('/ticket-submitted');
    } catch (error: any) {
      toast({
        title: "Error submitting ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">CENTURY 21</h2>
          </div>
          <CardTitle className="text-2xl">Submit Support Ticket</CardTitle>
          <CardDescription>
            Fill out the form below to submit a support ticket. Our team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="franchise_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Franchise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your franchise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingFranchises ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading franchises...</div>
                        ) : franchises.length > 0 ? (
                          franchises.map((franchise) => (
                            <SelectItem key={franchise.id} value={franchise.id}>
                              {franchise.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No franchises found</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="franchise_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@century21.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="franchise_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+32 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide detailed information about your issue..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <FormDescription>
                  Upload files related to your issue (max 10MB per file). Accepted formats: images, PDF, DOC, DOCX, TXT.
                </FormDescription>
                
                {/* File list */}
                {files.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-secondary rounded-md">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Dropzone */}
                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop files here, or click to select files
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center">
          By submitting this form, you agree to our terms of service and privacy policy.
        </CardFooter>
      </Card>
    </div>
  );
}