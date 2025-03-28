import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function VisitDetailsDialog({ isOpen, onClose, visit, actionPlans }) {
  if (!visit) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString || "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Visit Details - {visit.type}
          </DialogTitle>
          <DialogDescription>
            Support visit on {formatDate(visit.date)} {visit.time ? `at ${visit.time}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
              <dl className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Type:</dt>
                  <dd className="text-sm">
                    <Badge variant="outline">{visit.type}</Badge>
                  </dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Date:</dt>
                  <dd className="text-sm">{formatDate(visit.date)}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Time:</dt>
                  <dd className="text-sm">{visit.time || "N/A"}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Duration:</dt>
                  <dd className="text-sm">{visit.duration}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Status:</dt>
                  <dd className="text-sm">
                    <Badge className={
                      visit.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : visit.status === "scheduled" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-yellow-100 text-yellow-800"
                    }>
                      {visit.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Consultant</h3>
              <dl className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <dt className="text-sm font-medium">Name:</dt>
                  <dd className="text-sm">{visit.consultant?.name || "Unknown"}</dd>
                </div>
              </dl>
            </div>
          </div>

          {visit.observations && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Observations</h3>
                <p className="text-sm whitespace-pre-line">{visit.observations}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Action Plan</h3>
            {actionPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No action plan items recorded for this visit.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionPlans.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="text-sm">{action.action}</TableCell>
                      <TableCell className="text-sm">{formatDate(action.deadline)}</TableCell>
                      <TableCell>
                        <Badge className={
                          action.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : action.status === "in progress" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-yellow-100 text-yellow-800"
                        }>
                          {action.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}