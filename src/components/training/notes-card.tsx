import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  MessageSquare,
  Save,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface NotesCardProps {
  eventId: number;
  initialNotes: string;
}

export function NotesCard({ eventId, initialNotes }: NotesCardProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayNotes, setDisplayNotes] = useState(initialNotes || "");

  // Initialize notes from props
  useEffect(() => {
    setNotes(initialNotes || "");
    setDisplayNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSaveNotes = async () => {
    if (!notes.trim() && !displayNotes) {
      // Nothing to save, and no previous notes exist
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('training_events')
        .update({
          notes: notes.trim()
        })
        .eq('id', eventId);
        
      if (error) throw error;
      
      setDisplayNotes(notes.trim());
      setIsEditing(false);
      
      toast({
        title: notes.trim() ? "Notes updated" : "Notes removed",
        description: notes.trim() 
          ? "The notes have been updated successfully" 
          : "The notes have been removed successfully",
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the notes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotes(displayNotes);
    setIsEditing(false);
  };

  const handleRemoveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('training_events')
        .update({
          notes: null
        })
        .eq('id', eventId);
        
      if (error) throw error;
      
      setNotes("");
      setDisplayNotes("");
      setIsEditing(false);
      
      toast({
        title: "Notes removed",
        description: "The notes have been removed successfully",
      });
    } catch (error) {
      console.error("Error removing notes:", error);
      toast({
        title: "Update failed",
        description: "Failed to remove the notes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="tagline-2">Internal Notes</CardTitle>
        {displayNotes && !isEditing && (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveNotes}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              placeholder="Add internal notes about the training session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[150px]"
              disabled={isSaving}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveNotes} 
                className="flex-1"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Notes
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </>
        ) : displayNotes ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{displayNotes}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8" />
              <p>No notes have been added yet</p>
            </div>
            <Button 
              onClick={() => setIsEditing(true)} 
              className="w-full"
            >
              <Edit className="mr-2 h-4 w-4" />
              Add Notes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}