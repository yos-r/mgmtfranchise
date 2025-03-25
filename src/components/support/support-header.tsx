import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupportHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="tagline-1">Franchise Support</h2>
        <p className="body-lead text-muted-foreground">
          Manage assistance visits and support programs
        </p>
      </div>
      <PlanVisitDialog />
    </div>
  );
}