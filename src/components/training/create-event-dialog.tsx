import { useState } from "react";
import { format } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Plus, Eye, Send } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    duration: "",
    description: "",
  });
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
# Training Agenda

## Objectives
- 
- 
-

## Materials Required
- 
- 
-

## Schedule
1. Introduction (XX minutes)
2. Main Topics (XX minutes)
3. Practical Exercise (XX minutes)
4. Q&A Session (XX minutes)
5. Wrap-up (XX minutes)
    `,
  });

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('training_events')
        .insert([
          {
            title: formData.title,
            type: formData.type,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            description: editor?.getHTML() || "",
            status: "scheduled",
          }
        ]);

      if (error) throw error;

      toast({
        title: "Event created",
        description: "The training event has been created successfully",
      });
      
      setIsOpen(false);
      onEventCreated();
      setFormData({
        title: "",
        type: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "10:00",
        duration: "",
        description: "",
      });
      editor?.commands.setContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create training event",
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
            Schedule a new training session or meeting
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="label-1">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                className="body-1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type" className="label-1">Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
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
                className="body-1"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="label-1">Time</Label>
              <Input
                id="time"
                type="time"
                className="body-1"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="label-1">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2h"
                className="body-1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="label-1">Event Details</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="button-2"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>
            {!showPreview ? (
              <div className="min-h-[300px] border rounded-md p-4">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <div className="min-h-[300px] border rounded-md p-4 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="button-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.type || !formData.date || !formData.time}
            className="button-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}