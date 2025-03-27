import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Mail,
  Plus,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateEventDialog } from "./create-event-dialog";
import { EventList } from "./event-list";
import { EventDetail } from "./event-detail";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function TrainingTab() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { toast } = useToast();

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        setEvents(data);
      }
    } catch (error) {
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
  }, []);

  const today = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  const pastEvents = events.filter(event => new Date(event.date) < today);

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
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
            <div className="numbers text-2xl font-bold">{upcomingEvents.length}</div>
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

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="button-2">
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="past" className="button-2">
            Past Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <EventList
            events={upcomingEvents}
            onEventSelect={setSelectedEvent}
            emptyMessage="No upcoming events scheduled"
          />
        </TabsContent>
        <TabsContent value="past">
          <EventList
            events={pastEvents}
            onEventSelect={setSelectedEvent}
            emptyMessage="No past events found"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}