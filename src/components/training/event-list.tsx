import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventListProps {
  meetings: any[];
  onEventSelect: (event: any) => void;
}

export function EventList({ meetings, onEventSelect }: EventListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Upcoming Events</CardTitle>
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
            {meetings.map((meeting) => (
              <TableRow
                key={meeting.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEventSelect(meeting)}
              >
                <TableCell className="body-1 font-medium">
                  {meeting.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {meeting.type}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">
                  {format(new Date(meeting.date), "MMM d, yyyy")} at {meeting.time}
                </TableCell>
                <TableCell className="body-1">{meeting.duration}</TableCell>
                <TableCell className="body-1">
                  {meeting.attendees.length} invited
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      new Date(meeting.date) > new Date()
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {new Date(meeting.date) > new Date() ? "Upcoming" : "Completed"}
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