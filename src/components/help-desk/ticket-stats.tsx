import { Ticket, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketStatsProps {
  tickets: any[];
}

export function TicketStats({ tickets }: TicketStatsProps) {
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Open Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{openTickets}</div>
          <p className="legal text-muted-foreground">
            Awaiting response
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{inProgressTickets}</div>
          <p className="legal text-muted-foreground">
            Being handled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{resolvedTickets}</div>
          <p className="legal text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Urgent Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{urgentTickets}</div>
          <p className="legal text-muted-foreground">
            Need attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}