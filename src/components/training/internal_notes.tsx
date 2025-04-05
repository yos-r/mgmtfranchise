import { useState, useEffect } from "react";
import { Pen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface InternalNotesCardProps {
  eventId: string;
  initialNotes?: string;
  noteBy?: string;
  onSave?: (notes: string, noteBy: string) => void;
}

export default function InternalNotesCard({ 
  eventId, 
  initialNotes = "", 
  noteBy = "",
  onSave 
}: InternalNotesCardProps) {
  // Use local state for immediate UI updates
  const [localNotes, setLocalNotes] = useState(initialNotes);
  const [isNotesUpdated, setIsNotesUpdated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [localLastEditedBy, setLocalLastEditedBy] = useState(noteBy);
  const { toast } = useToast();

  // Get current user when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };

    getCurrentUser();
  }, []);

  // Update local state when props change
  useEffect(() => {
    setLocalNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setLocalLastEditedBy(noteBy);
  }, [noteBy]);

  const handleInternalNotesChange = (e) => {
    setLocalNotes(e.target.value);
    setIsNotesUpdated(true);
  };

  const saveInternalNotes = async () => {
    try {
      // Get user email from the authenticated user
      const userEmail = user?.email || "Unknown user";
      
      // If parent provided a save handler, use it (direct mutation approach)
      if (onSave) {
        onSave(localNotes, userEmail);
        setIsNotesUpdated(false);
        setLocalLastEditedBy(userEmail);
        return;
      }
      
      // Otherwise use the direct database update
      const { error } = await supabase
        .from('training_events')
        .update({
          notes: localNotes,
          note_by: userEmail
        })
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setLocalLastEditedBy(userEmail);
      
      toast({
        title: "Notes updated",
        description: "Internal notes have been saved",
      });
      setIsNotesUpdated(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Update failed",
        description: "Failed to save internal notes",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Pen className="h-4 w-4 mr-2 text-muted-foreground" />
            Internal Notes
          </CardTitle>
        </div>
        {localLastEditedBy && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <User className="h-3 w-3 mr-1" />
            <span>Last edited by: {localLastEditedBy}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add internal notes about this event..."
          className="min-h-[100px]"
          value={localNotes}
          onChange={handleInternalNotesChange}
        />
      </CardContent>
      {isNotesUpdated && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={saveInternalNotes}
          >
            Save Notes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}