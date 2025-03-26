import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/lib/supabase";
import { EventDetail } from "./event-detail";
import { CreateEventDialog } from "./create-event-dialog";

const meetings = [
  {
    id: 1,
    title: "Q2 Strategy Meeting",
    type: "meeting",
    date: "2024-04-15",
    time: "10:00",
    duration: "2h",
    attendees: [
      { id: 1, name: "Marie Laurent", franchise: "Saint-Germain", attended: true },
      { id: 2, name: "Thomas Bernard", franchise: "Confluence", attended: false },
      { id: 3, name: "Sophie Martin", franchise: "Vieux Port", attended: true },
    ],
  },
  {
    id: 2,
    title: "Digital Marketing Training",
    type: "training",
    date: "2024-04-20",
    time: "14:00",
    duration: "3h",
    attendees: [
      { id: 1, name: "Marie Laurent", franchise: "Saint-Germain", attended: null },
      { id: 2, name: "Thomas Bernard", franchise: "Confluence", attended: null },
      { id: 3, name: "Sophie Martin", franchise: "Vieux Port", attended: null },
    ],
  },
];
export function TrainingTab() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('training_events')
      .select('*')
      .order('date', { ascending: true });

    console.log('The data is ', data)
    if (!error && data) {
      setEvents(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Training & Meetings</h2>
          <p className="body-lead text-muted-foreground">
            Schedule and manage training sessions and meetings
          </p>
        </div>
        <CreateEventDialog onEventCreated={loadEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">8</div>
            <p className="legal text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">85%</div>
            <p className="legal text-muted-foreground">
              Last 3 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Training Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">24h</div>
            <p className="legal text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Participation Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">92%</div>
            <p className="legal text-muted-foreground">
              Response rate
            </p>
          </CardContent>
        </Card>
      </div>

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
                  onClick={() => setSelectedEvent(meeting)}
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.date}
                  </TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.duration}</TableCell>
                  <TableCell>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}