import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";

export function PlanVisitDialog() {
    const { toast } = useToast();
    
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
        }),
      ],
      content: `
  1. Team Performance Review
  2. Marketing Strategy Assessment
  3. Technology Implementation Check
  4. Training Needs Analysis
      `,
    });
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="button-1">
            <Plus className="mr-2 h-4 w-4" />
            Plan Visit
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="tagline-2">Plan Assistance Visit</DialogTitle>
            <DialogDescription className="body-lead">
              Schedule a new franchise assistance visit
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="franchise" className="label-1">Franchise</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select franchise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saint-germain">CENTURY 21 Saint-Germain</SelectItem>
                    <SelectItem value="confluence">CENTURY 21 Confluence</SelectItem>
                    <SelectItem value="vieux-port">CENTURY 21 Vieux Port</SelectItem>
                    <SelectItem value="bordeaux">CENTURY 21 Bordeaux Centre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="consultant" className="label-1">Consultant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jean">Jean Dupont</SelectItem>
                    <SelectItem value="marie">Marie Lambert</SelectItem>
                    <SelectItem value="pierre">Pierre Martin</SelectItem>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="label-1">Time</Label>
                <Input
                  id="time"
                  type="time"
                  className="body-1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration" className="label-1">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2h"
                  className="body-1"
                />
              </div>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="type" className="label-1">Visit Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly Review</SelectItem>
                  <SelectItem value="performance">Performance Review</SelectItem>
                  <SelectItem value="training">Training Support</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
  
            <div className="grid gap-2">
              <Label className="label-1">Visit Program</Label>
              <div className="min-h-[300px] border rounded-md p-4">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                toast({
                  title: "Visit planned",
                  description: "The assistance visit has been scheduled",
                });
              }}
              className="button-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Plan Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }