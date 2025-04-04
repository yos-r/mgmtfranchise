import { useState, useEffect } from "react";
import { Pen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function VisitInternalNotes({ visitId, initialNotes = "", notesBy = "" }) {
  const [internalNotes, setInternalNotes] = useState(initialNotes);
  const [isNotesUpdated, setIsNotesUpdated] = useState(false);
  const [user, setUser] = useState(null);
  const [lastEditedBy, setLastEditedBy] = useState(notesBy);
  const { toast } = useToast();

  useEffect(() => {
    // Get the current authenticated user
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };

    getCurrentUser();
  }, []);

  // Update notes when initialNotes prop changes
  useEffect(() => {
    setInternalNotes(initialNotes);
  }, [initialNotes]);

  // Update lastEditedBy when notesBy prop changes
  useEffect(() => {
    setLastEditedBy(notesBy);
  }, [notesBy]);

  const handleInternalNotesChange = (e) => {
    setInternalNotes(e.target.value);
    setIsNotesUpdated(true);
  };

  const saveInternalNotes = async () => {
    try {
      // Get user email from the authenticated user
      const userEmail = user?.email || "Unknown user";
      
      const { error } = await supabase
        .from('support_visits')
        .update({
          observations: internalNotes,
          observations_by: userEmail // Save the email of the authenticated user
        })
        .eq('id', visitId);

      if (error) throw error;

      // Update the last edited by value
      setLastEditedBy(userEmail);
      
      toast({
        title: "Notes updated",
        description: "Visit notes have been saved",
      });
      setIsNotesUpdated(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Update failed",
        description: "Failed to save visit notes",
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
            Visit Notes
          </CardTitle>
        </div>
        {lastEditedBy && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <User className="h-3 w-3 mr-1" />
            <span>Last edited by: {lastEditedBy}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add notes about this visit..."
          className="min-h-[100px]"
          value={internalNotes}
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