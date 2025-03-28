import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Mail,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateEventDialog } from "./create-event-dialog";
import { EventDetail } from "./event-detail";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function TrainingTab() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select(`
          *,
          training_attendance(
            *,
            franchises(*)
          )
        `)
        .order('date', { ascending: true });
  
      if (error) throw error;
  
      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error loading events",
        description: "Failed to load training events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Set up real-time subscription
    const channel = supabase
      .channel('training_events_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'training_events' 
        }, 
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => {
      setSelectedEvent(null);
      loadEvents(); // Reload events when returning to list
    }} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;
  const completedEvents = events.filter(event => new Date(event.date) < new Date()).length;
  const totalHours = events.reduce((acc, event) => {
    const duration = parseInt(event.duration);
    return isNaN(duration) ? acc : acc + duration;
  }, 0);

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
            <div className="numbers text-2xl font-bold">{upcomingEvents}</div>
            <p className="legal text-muted-foreground">
              Scheduled events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Completed Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{completedEvents}</div>
            <p className="legal text-muted-foreground">
              Past events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Training Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{totalHours}h</div>
            <p className="legal text-muted-foreground">
              Total duration
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
          <CardTitle>Training Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Event</TableHead>
                <TableHead className="label-1">Type</TableHead>
                <TableHead className="label-1">Trainer</TableHead>
                <TableHead className="label-1">Date & Time</TableHead>
                <TableHead className="label-1">Duration</TableHead>
                <TableHead className="label-1">Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEvent(event)}
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
                    {event.trainer || '-'}
                  </TableCell>
                  <TableCell className="body-1">
                    {format(new Date(event.date), "MMM d, yyyy")} at {event.time}
                  </TableCell>
                  <TableCell className="body-1">{event.duration}</TableCell>
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
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No training events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}