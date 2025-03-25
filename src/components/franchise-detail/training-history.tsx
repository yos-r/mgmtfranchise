import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const trainingHistory = [
  {
    id: 1,
    title: "Digital Marketing Training",
    type: "training",
    date: "2024-03-15",
    duration: "3h",
    trainer: "Marie Lambert",
    attended: true,
  },
  {
    id: 2,
    title: "Sales Techniques Workshop",
    type: "workshop",
    date: "2024-02-20",
    duration: "4h",
    trainer: "Jean Dupont",
    attended: false,
  },
  {
    id: 3,
    title: "Property Valuation Masterclass",
    type: "masterclass",
    date: "2024-01-10",
    duration: "6h",
    trainer: "Sophie Martin",
    attended: true,
  },
];

export function TrainingHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Training Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Training</TableHead>
              <TableHead className="label-1">Type</TableHead>
              <TableHead className="label-1">Date</TableHead>
              <TableHead className="label-1">Duration</TableHead>
              <TableHead className="label-1">Trainer</TableHead>
              <TableHead className="label-1">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingHistory.map((training) => (
              <TableRow key={training.id}>
                <TableCell className="body-1 font-medium">
                  {training.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="label-2">
                    {training.type}
                  </Badge>
                </TableCell>
                <TableCell className="body-1">
                  {format(new Date(training.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="body-1">{training.duration}</TableCell>
                <TableCell className="body-1">{training.trainer}</TableCell>
                <TableCell>
                  <Badge className={training.attended ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {training.attended ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}