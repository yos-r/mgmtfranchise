import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VisitListProps {
  visits: any[];
  onVisitSelect: (visit: any) => void;
}
const getStatusBadgeClasses = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-800";
    case "scheduled":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};
export function VisitList({ visits, onVisitSelect }: VisitListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Assistance Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Franchise</TableHead>
              <TableHead className="label-1">Consultant</TableHead>
              <TableHead className="label-1">Type</TableHead>
              <TableHead className="label-1">Date & Time</TableHead>
              <TableHead className="label-1">Duration</TableHead>
              <TableHead className="label-1">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow
                key={visit.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onVisitSelect(visit)}
              >
                <TableCell className="body-1 font-medium">
                  {visit.franchise}
                </TableCell>
                <TableCell className="body-1">{visit.consultant}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {visit.type}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">
                  {format(new Date(visit.date), "MMM d, yyyy")} at {visit.time}
                </TableCell>
                <TableCell className="body-1">{visit.duration}</TableCell>
                <TableCell>
                  <Badge
                    className={getStatusBadgeClasses(visit.status)}
                  >
                    {visit.status}
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