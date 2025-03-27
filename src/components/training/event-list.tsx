import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventListProps {
  events: any[];
  onEventSelect: (event: any) => void;
  emptyMessage: string;
}

export function EventList({ events, onEventSelect, emptyMessage }: EventListProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Event</TableHead>
              <TableHead className="label-1">Type</TableHead>
              <TableHead className="label-1">Date & Time</TableHead>
              <TableHead className="label-1">Duration</TableHead>
              <TableHead className="label-1">Attendees</TableHead>
              <TableHead className="label-1">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEventSelect(event)}
              >
                <TableCell className="body-1 font-medium">
                  {event.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {event.type}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">
                  {format(new Date(event.date), "MMM d, yyyy")} at {event.time}
                </TableCell>
                <TableCell className="body-1">{event.duration}</TableCell>
                <TableCell className="body-1">
                  {event.attendees?.length || 0} invited
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      new Date(event.date) > new Date()
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {new Date(event.date) > new Date() ? "Upcoming" : "Completed"}
                  </Badge>
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