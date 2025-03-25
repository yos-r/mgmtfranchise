import { Calendar, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Planned Visits</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">6</div>
          <p className="legal text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Completed Visits</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">12</div>
          <p className="legal text-muted-foreground">
            This quarter
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Active Action Plans</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">8</div>
          <p className="legal text-muted-foreground">
            In progress
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Support Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">45h</div>
          <p className="legal text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}