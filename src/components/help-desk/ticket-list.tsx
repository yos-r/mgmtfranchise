import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketListProps {
  tickets: any[];
  onTicketSelect: (ticket: any) => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TicketList({ tickets, onTicketSelect }: TicketListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Title</TableHead>
              <TableHead className="label-1">Franchise</TableHead>
              <TableHead className="label-1">Category</TableHead>
              <TableHead className="label-1">Priority</TableHead>
              <TableHead className="label-1">Status</TableHead>
              <TableHead className="label-1">Assigned To</TableHead>
              <TableHead className="label-1">Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer"
                onClick={() => onTicketSelect(ticket)}
              >
                <TableCell className="body-1 font-medium">
                  {ticket.title}
                </TableCell>
                <TableCell className="body-1">
                  {ticket.franchise?.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {ticket.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getPriorityColor(ticket.priority)} label-2`}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(ticket.status)} label-2`}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">
                  {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : '-'}
                </TableCell>
                <TableCell className="body-1">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" className="button-2">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}