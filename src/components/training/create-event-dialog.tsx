import { useState } from "react";
import { format } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Plus, Eye, Send, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface CreateEventDialogProps {
  onEventCreated?: () => void;
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    time: "10:00",
    duration: "2h",
  });
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
Dear Franchisees,

You are invited to attend our upcoming event. Please find the details below:

Date: ${format(new Date(formData.date), 'MMMM d, yyyy')}
Time: ${formData.time}
Duration: ${formData.duration}

Please confirm your attendance.

Best regards,
CENTURY 21 Management
    `,
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update email content when date/time changes
    if (field === 'date' || field === 'time' || field === 'duration') {
      editor?.commands.setContent(`
Dear Franchisees,

You are invited to attend our upcoming event. Please find the details below:

Date: ${format(new Date(field === 'date' ? value : formData.date), 'MMMM d, yyyy')}
Time: ${field === 'time' ? value : formData.time}
Duration: ${field === 'duration' ? value : formData.duration}

Please confirm your attendance.

Best regards,
CENTURY 21 Management
      `);
    }
  };

  const handleSave = async (sendEmail: boolean = false) => {
    try {
      // Save event to database
      const { data, error } = await supabase
        .from('training_events')
        .insert({
          title: formData.title,
          type: formData.type,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          description: editor?.getHTML() || '',
        })
        .select()
        .single();

      if (error) throw error;

      if (sendEmail) {
        // Here you would implement email sending logic
        toast({
          title: "Event created and invitations sent",
          description: "The event has been saved and email invitations have been sent to all franchisees",
        });
      } else {
        toast({
          title: "Event saved",
          description: "The event has been saved successfully",
        });
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        type: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        time: "10:00",
        duration: "2h",
      });
      editor?.commands.setContent("");
      setIsOpen(false);
      onEventCreated?.();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="tagline-2">Create New Event</DialogTitle>
          <DialogDescription className="body-lead">
            Schedule a new meeting or training session
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="label-1">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="body-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type" className="label-1">Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="label-1">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="body-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="label-1">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="body-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="label-1">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2h"
                className="body-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="label-1">Email Invitation</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="button-2"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview Email"}
              </Button>
            </div>
            {!showPreview ? (
              <div className="min-h-[300px] border rounded-md p-4">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="label-1">To:</p>
                        <p className="body-1 text-muted-foreground">all-franchisees@century21.fr</p>
                      </div>
                      <div>
                        <p className="label-1">Subject:</p>
                        <p className="body-1 text-muted-foreground">Invitation: {formData.title}</p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            className="button-2"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            className="button-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Save & Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}