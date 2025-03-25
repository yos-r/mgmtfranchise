import { Calendar, Users, Clock, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainingStats() {
  return (
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
  );
}