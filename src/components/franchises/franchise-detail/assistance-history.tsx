import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const assistanceHistory = [
  {
    id: 1,
    type: "Quarterly Review",
    consultant: "Jean Dupont",
    date: "2024-03-10",
    duration: "3h",
    status: "completed",
  },
  {
    id: 2,
    type: "Technical Support",
    consultant: "Marie Lambert",
    date: "2024-02-15",
    duration: "2h",
    status: "completed",
  },
  {
    id: 3,
    type: "Performance Review",
    consultant: "Sophie Martin",
    date: "2024-01-20",
    duration: "4h",
    status: "completed",
  },
];

export function AssistanceHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Assistance Visit History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Type</TableHead>
              <TableHead className="label-1">Consultant</TableHead>
              <TableHead className="label-1">Date</TableHead>
              <TableHead className="label-1">Duration</TableHead>
              <TableHead className="label-1">Status</TableHead>
              <TableHead className="label-1 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assistanceHistory.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {visit.type}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">{visit.consultant}</TableCell>
                <TableCell className="body-1">
                  {format(new Date(visit.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="body-1">{visit.duration}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">
                    {visit.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="button-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
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