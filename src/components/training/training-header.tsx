import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrainingHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="tagline-1">Training & Meetings</h2>
        <p className="body-lead text-muted-foreground">
          Schedule and manage training sessions and meetings
        </p>
      </div>
      <CreateEventDialog />
    </div>
  );
}