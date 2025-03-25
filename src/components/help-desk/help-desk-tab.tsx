import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketList } from "./ticket-list";
import { TicketDetail } from "./ticket-detail";
import { CreateTicketDialog } from "./create-ticket-dialog";
import { TicketStats } from "./ticket-stats";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function HelpDeskTab() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const { toast } = useToast();

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from('help_desk_tickets')
      .select(`
        *,
        franchise:franchises(name),
        assignee:team_members(first_name, last_name),
        comments:ticket_comments(
          *,
          author:team_members(first_name, last_name)
        ),
        attachments:ticket_attachments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading tickets",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTickets(data || []);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => {
          setSelectedTicket(null);
          loadTickets();
        }}
        onUpdate={loadTickets}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Help Desk</h2>
          <p className="body-lead text-muted-foreground">
            Manage support tickets from franchisees
          </p>
        </div>
        <CreateTicketDialog
          open={isCreatingTicket}
          onOpenChange={setIsCreatingTicket}
          onTicketCreated={() => {
            loadTickets();
            setIsCreatingTicket(false);
          }}
        />
      </div>

      <TicketStats tickets={tickets} />

      <TicketList
        tickets={tickets}
        onTicketSelect={setSelectedTicket}
      />
    </div>
  );
}